from datetime import date as date_type
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from . import models, schemas, crud
from .database import Base, engine, get_db, SessionLocal
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


@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        if db.query(models.ScheduleItem).count() == 0:
            sample_schedule = [
                models.ScheduleItem(class_num="10", class_letter="A", day_of_week=0, lesson_num=1, time_slot="08:30 - 09:15", subject="Математика", room="301", teacher_name="Иванов И.И."),
                models.ScheduleItem(class_num="10", class_letter="A", day_of_week=0, lesson_num=2, time_slot="09:25 - 10:10", subject="Физика", room="204", teacher_name="Петров П.П."),
                models.ScheduleItem(class_num="10", class_letter="A", day_of_week=0, lesson_num=3, time_slot="10:20 - 11:05", subject="Информатика", room="105", teacher_name="Смирнов А.В."),
                models.ScheduleItem(class_num="10", class_letter="A", day_of_week=1, lesson_num=1, time_slot="08:30 - 09:15", subject="История Казахстана", room="210", teacher_name="Касымова Г.А."),
                models.ScheduleItem(class_num="10", class_letter="A", day_of_week=1, lesson_num=2, time_slot="09:25 - 10:10", subject="Литература", room="305", teacher_name="Ахметова А.Б."),
                models.ScheduleItem(class_num="10", class_letter="A", day_of_week=2, lesson_num=1, time_slot="08:30 - 09:15", subject="Алгебра", room="301", teacher_name="Иванов И.И."),
                models.ScheduleItem(class_num="10", class_letter="A", day_of_week=2, lesson_num=2, time_slot="09:25 - 10:10", subject="Английский язык", room="402", teacher_name="Джонсон М."),
                models.ScheduleItem(class_num="10", class_letter="A", day_of_week=3, lesson_num=1, time_slot="08:30 - 09:15", subject="Геометрия", room="301", teacher_name="Иванов И.И."),
                models.ScheduleItem(class_num="10", class_letter="A", day_of_week=3, lesson_num=2, time_slot="09:25 - 10:10", subject="Химия", room="208", teacher_name="Нурланова З.К."),
                models.ScheduleItem(class_num="10", class_letter="A", day_of_week=4, lesson_num=1, time_slot="08:30 - 09:15", subject="Биология", room="207", teacher_name="Сулейменов Б.С."),
                models.ScheduleItem(class_num="10", class_letter="A", day_of_week=4, lesson_num=2, time_slot="09:25 - 10:10", subject="Информатика", room="105", teacher_name="Смирнов А.В."),
            ]
            db.add_all(sample_schedule)
            db.commit()

        if db.query(models.Homework).count() == 0:
            today = date_type.today()
            sample_homeworks = [
                models.Homework(class_num="10", class_letter="A", subject="Математика", title="Решить производные №145-152", description="Учебник стр. 84, выполнять в тетради с чертежами.", due_date=today),
                models.Homework(class_num="10", class_letter="A", subject="Информатика", title="Написать алгоритм сортировки на JS", description="Создать функцию быстрой сортировки и протестировать на массиве чисел.", due_date=today),
                models.Homework(class_num="10", class_letter="A", subject="История Казахстана", title="Конспект параграфа 12", description="Подготовить тезисы к дискуссии по теме Ханства.", due_date=today),
                models.Homework(class_num="10", class_letter="A", subject="Физика", title="Задачи по термодинамике", description="Задачи №4, 7, 12 из сборника упражнений.", due_date=today),
            ]
            db.add_all(sample_homeworks)
            db.commit()
    finally:
        db.close()



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


# ---------- schedule ----------
@app.get("/schedule", response_model=List[schemas.ScheduleItemOut])
def get_schedule(
    class_num: Optional[str] = None,
    class_letter: Optional[str] = None,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_class = class_num or user.class_num or "10"
    target_letter = class_letter or user.class_letter or "A"

    items = db.query(models.ScheduleItem).filter(
        models.ScheduleItem.class_num == target_class,
        models.ScheduleItem.class_letter == target_letter,
    ).order_by(models.ScheduleItem.day_of_week, models.ScheduleItem.lesson_num).all()

    return items


@app.post("/schedule", response_model=schemas.ScheduleItemOut)
def create_schedule_item(
    payload: schemas.ScheduleItemIn,
    user: models.User = Depends(require_role("teacher", "admin")),
    db: Session = Depends(get_db),
):
    item = models.ScheduleItem(**payload.dict())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/schedule/{item_id}")
def delete_schedule_item(
    item_id: str,
    user: models.User = Depends(require_role("teacher", "admin")),
    db: Session = Depends(get_db),
):
    item = db.query(models.ScheduleItem).filter(models.ScheduleItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Занятие не найдено")
    db.delete(item)
    db.commit()
    return {"ok": True}


# ---------- homeworks ----------
@app.get("/homeworks", response_model=List[schemas.HomeworkOut])
def get_homeworks(
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_class = user.class_num or "10"
    target_letter = user.class_letter or "A"

    if user.role == models.Role.student:
        hws = db.query(models.Homework).filter(
            models.Homework.class_num == target_class,
            models.Homework.class_letter == target_letter,
        ).order_by(models.Homework.due_date.asc()).all()

        statuses = {
            s.homework_id: s.completed
            for s in db.query(models.HomeworkStatus).filter(models.HomeworkStatus.student_id == user.id).all()
        }

        result = []
        for hw in hws:
            out = schemas.HomeworkOut.from_orm(hw)
            out.completed = statuses.get(hw.id, False)
            result.append(out)
        return result
    else:
        hws = db.query(models.Homework).order_by(models.Homework.due_date.asc()).all()
        return [schemas.HomeworkOut.from_orm(hw) for hw in hws]


@app.post("/homeworks", response_model=schemas.HomeworkOut)
def create_homework(
    payload: schemas.HomeworkIn,
    user: models.User = Depends(require_role("teacher", "admin")),
    db: Session = Depends(get_db),
):
    hw = models.Homework(**payload.dict(), created_by=user.id)
    db.add(hw)
    db.commit()
    db.refresh(hw)
    return schemas.HomeworkOut.from_orm(hw)


@app.post("/homeworks/{homework_id}/toggle")
def toggle_homework(
    homework_id: str,
    user: models.User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    status_rec = db.query(models.HomeworkStatus).filter(
        models.HomeworkStatus.homework_id == homework_id,
        models.HomeworkStatus.student_id == user.id,
    ).first()

    if status_rec is None:
        status_rec = models.HomeworkStatus(
            homework_id=homework_id,
            student_id=user.id,
            completed=True,
        )
        db.add(status_rec)
    else:
        status_rec.completed = not status_rec.completed

    db.commit()
    return {"homework_id": homework_id, "completed": status_rec.completed}


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
        stars = crud.stars_for(avg)
        rows.append(schemas.RankingRow(
            student_id=s.id,
            name=s.name,
            class_num=s.class_num or "10",
            class_letter=s.class_letter or "A",
            avg_productivity=avg,
            stars=stars,
            entries_count=len(entries),
        ))
    rows.sort(key=lambda r: r.avg_productivity, reverse=True)
    return rows


@app.get("/admin/users", response_model=List[schemas.UserOut])
def list_all_users(user: models.User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    return db.query(models.User).all()


@app.put("/admin/users/{user_id}/role", response_model=schemas.UserOut)
def update_user_role(
    user_id: str,
    payload: schemas.UserRoleUpdate,
    user: models.User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(404, "Пользователь не найден")
    if payload.role not in ("student", "teacher", "admin"):
        raise HTTPException(400, "Недопустимая роль")
    target.role = payload.role
    db.commit()
    db.refresh(target)
    return target


@app.get("/admin/stats")
def admin_stats(user: models.User = Depends(require_role("admin")), db: Session = Depends(get_db)):
    students = db.query(models.User).filter(models.User.role == models.Role.student).count()
    teachers = db.query(models.User).filter(models.User.role == models.Role.teacher).count()
    total_users = db.query(models.User).count()
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
    return {
        "students": students,
        "teachers": teachers,
        "total_users": total_users,
        "school_avg_productivity": school_avg,
    }

