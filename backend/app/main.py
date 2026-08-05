from datetime import date as date_type
from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from . import models, schemas, crud
from .database import Base, engine, get_db
from .auth import hash_password, verify_password, create_access_token, get_current_user, require_role

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Индекс продуктивности ученика — API")

# In production, replace "*" with your deployed frontend's exact origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def entry_to_out(e: models.Entry) -> schemas.EntryOut:
    score = crud.calc_productivity(e)
    return schemas.EntryOut(
        id=e.id, student_id=e.student_id, date=e.date,
        homework_done=e.homework_done, lessons_count=e.lessons_count, tasks_done=e.tasks_done,
        avg_grade=e.avg_grade, prep_time_min=e.prep_time_min, ent_prep_min=e.ent_prep_min,
        reading_min=e.reading_min, self_study_min=e.self_study_min, goals_percent=e.goals_percent,
        attended=e.attended, late=e.late, absent=e.absent, extra_activities=e.extra_activities or [],
        sleep_hours=e.sleep_hours, mood=e.mood, wellbeing=e.wellbeing,
        teacher_homework_checked=e.teacher_homework_checked, teacher_remark=e.teacher_remark or "",
        teacher_grade_set=e.teacher_grade_set, productivity=score, stars=crud.stars_for(score),
    )


# ---------- auth ----------
@app.post("/auth/register", response_model=schemas.TokenOut)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if payload.role not in ("student", "teacher", "admin"):
        raise HTTPException(400, "Недопустимая роль")
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(400, "Пользователь с таким email уже существует")

    user = models.User(
        role=payload.role, name=payload.name, email=payload.email,
        password_hash=hash_password(payload.password), school=payload.school or "", city=payload.city or "",
        class_num=payload.class_num, class_letter=payload.class_letter, subject=payload.subject,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    return schemas.TokenOut(access_token=token, user=user)


@app.post("/auth/login", response_model=schemas.TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(401, "Неверный email или пароль")
    token = create_access_token(user.id)
    return schemas.TokenOut(access_token=token, user=user)


@app.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user


# ---------- student entries ----------
@app.post("/entries", response_model=schemas.EntryOut)
def upsert_entry(
    payload: schemas.EntryIn,
    user: models.User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    entry_date = payload.date or date_type.today()
    entry = db.query(models.Entry).filter(
        models.Entry.student_id == user.id, models.Entry.date == entry_date
    ).first()
    if entry is None:
        entry = models.Entry(student_id=user.id, date=entry_date)
        db.add(entry)

    for field in (
        "homework_done", "lessons_count", "tasks_done", "avg_grade", "prep_time_min", "ent_prep_min",
        "reading_min", "self_study_min", "goals_percent", "attended", "late", "absent",
        "extra_activities", "sleep_hours", "mood", "wellbeing",
    ):
        setattr(entry, field, getattr(payload, field))

    db.commit()
    db.refresh(entry)
    return entry_to_out(entry)


@app.get("/entries/mine", response_model=List[schemas.EntryOut])
def my_entries(days: int = 7, user: models.User = Depends(require_role("student")), db: Session = Depends(get_db)):
    dates = crud.last_n_dates(days)
    entries = db.query(models.Entry).filter(
        models.Entry.student_id == user.id, models.Entry.date.in_(dates)
    ).all()
    return [entry_to_out(e) for e in entries]


# ---------- teacher ----------
@app.get("/students", response_model=List[schemas.UserOut])
def list_students(user: models.User = Depends(require_role("teacher", "admin")), db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.role == models.Role.student).all()


@app.get("/students/{student_id}/entries", response_model=List[schemas.EntryOut])
def student_entries(
    student_id: str, days: int = 30,
    user: models.User = Depends(require_role("teacher", "admin")), db: Session = Depends(get_db),
):
    dates = crud.last_n_dates(days)
    entries = db.query(models.Entry).filter(
        models.Entry.student_id == student_id, models.Entry.date.in_(dates)
    ).all()
    return [entry_to_out(e) for e in entries]


@app.put("/students/{student_id}/teacher-update", response_model=schemas.EntryOut)
def teacher_update(
    student_id: str, payload: schemas.TeacherUpdateIn,
    user: models.User = Depends(require_role("teacher")), db: Session = Depends(get_db),
):
    entry = db.query(models.Entry).filter(
        models.Entry.student_id == student_id, models.Entry.date == payload.date
    ).first()
    if entry is None:
        entry = models.Entry(student_id=student_id, date=payload.date)
        db.add(entry)

    if payload.avg_grade is not None:
        entry.avg_grade = payload.avg_grade
        entry.teacher_grade_set = True
    if payload.attendance_mark is not None:
        entry.absent = payload.attendance_mark == "absent"
        entry.late = payload.attendance_mark == "late"
        entry.attended = payload.attendance_mark != "absent"
    if payload.homework_checked is not None:
        entry.teacher_homework_checked = payload.homework_checked
    if payload.remark is not None:
        entry.teacher_remark = payload.remark

    db.commit()
    db.refresh(entry)
    return entry_to_out(entry)


# ---------- ranking & admin ----------
@app.get("/ranking", response_model=List[schemas.RankingRow])
def ranking(days: int = 7, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    dates = crud.last_n_dates(days)
    students = db.query(models.User).filter(models.User.role == models.Role.student).all()
    rows = []
    for s in students:
        entries = db.query(models.Entry).filter(
            models.Entry.student_id == s.id, models.Entry.date.in_(dates)
        ).all()
        scores = [crud.calc_productivity(e) for e in entries]
        avg = round(sum(scores) / len(scores)) if scores else 0
        rows.append(schemas.RankingRow(student_id=s.id, name=s.name, avg_productivity=avg))
    rows.sort(key=lambda r: r.avg_productivity, reverse=True)
    return rows


@app.get("/admin/stats")
def admin_stats(user: models.User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    students = db.query(models.User).filter(models.User.role == models.Role.student).count()
    teachers = db.query(models.User).filter(models.User.role == models.Role.teacher).count()
    dates = crud.last_n_dates(7)
    all_students = db.query(models.User).filter(models.User.role == models.Role.student).all()
    scores = []
    for s in all_students:
        entries = db.query(models.Entry).filter(
            models.Entry.student_id == s.id, models.Entry.date.in_(dates)
        ).all()
        if entries:
            scores.append(sum(crud.calc_productivity(e) for e in entries) / len(entries))
    school_avg = round(sum(scores) / len(scores)) if scores else 0
    return {"students": students, "teachers": teachers, "school_avg_productivity": school_avg}
