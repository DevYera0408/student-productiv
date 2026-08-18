from datetime import date as date_type
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from . import models, schemas, crud
from .database import Base, engine, get_db, SessionLocal
from .auth import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, rotate_refresh_token,
    verify_refresh_token, revoke_refresh_token,
    revoke_access_token,
    get_current_user, require_role
)

Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Индекс продуктивности ученика — API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
    import os
    seed_demo = os.getenv("SEED_DEMO_DATA", "false").lower() == "true"
    
    db = SessionLocal()
    try:
        if seed_demo and db.query(models.User).count() == 0:
            student_user = models.User(
                role=models.Role.student,
                name="Ералы Сериков",
                email="student@example.com",
                password_hash=hash_password("password123"),
                school="НИШ ФМН",
                city="Алматы",
                class_num="10",
                class_letter="A",
            )
            teacher_user = models.User(
                role=models.Role.teacher,
                name="Иванов И.И.",
                email="teacher@example.com",
                password_hash=hash_password("password123"),
                school="НИШ ФМН",
                city="Алматы",
                subject="Математика",
            )
            admin_user = models.User(
                role=models.Role.admin,
                name="Администратор Школы",
                email="admin@example.com",
                password_hash=hash_password("password123"),
                school="НИШ ФМН",
                city="Алматы",
            )
            db.add_all([student_user, teacher_user, admin_user])
            db.commit()

            today = date_type.today()
            from datetime import timedelta
            sample_entries = [
                models.Entry(
                    student_id=student_user.id,
                    date=today - timedelta(days=d),
                    homework_done=True,
                    lessons_count=6,
                    tasks_done=5 + (d % 2),
                    avg_grade=85 + ((6 - d) * 2),
                    prep_time_min=60,
                    ent_prep_min=45,
                    reading_min=30,
                    goals_percent=90,
                    attended=True,
                    late=(d == 2),
                    absent=False,
                    sleep_hours=8.0,
                    mood=4,
                    wellbeing=4,
                    teacher_remark="Отличная динамика в учёбе!" if d == 0 else ""
                )
                for d in range(6, -1, -1)
            ]
            db.add_all(sample_entries)
            db.commit()

        if seed_demo and db.query(models.ScheduleItem).count() == 0:
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

        if seed_demo and db.query(models.Homework).count() == 0:
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


def check_teacher_access_to_student(teacher: models.User, student: models.User, db: Session) -> bool:
    """Check if teacher has access to the student."""
    if teacher.role == models.Role.admin:
        return True
    if teacher.role != models.Role.teacher:
        return False
    if not teacher.subject:
        return False
    if not student.class_num or not student.class_letter:
        return False
    taught_classes = db.query(models.ScheduleItem.class_num, models.ScheduleItem.class_letter).filter(
        models.ScheduleItem.subject == teacher.subject
    ).distinct().all()
    return (student.class_num, student.class_letter) in taught_classes



# ---------- auth ----------
@app.post("/auth/register", response_model=schemas.TokenOut)
@limiter.limit("5/minute")
def register(request: Request, payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
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
    access_token = create_access_token(user.id, user.role.value)
    refresh_token, _ = create_refresh_token(db, user.id)
    return schemas.TokenOut(access_token=access_token, refresh_token=refresh_token, user=user)


@app.post("/auth/login", response_model=schemas.TokenOut)
@limiter.limit("10/minute")
def login(request: Request, form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(401, "Неверный email или пароль")
    access_token = create_access_token(user.id, user.role.value)
    refresh_token, _ = create_refresh_token(db, user.id)
    return schemas.TokenOut(access_token=access_token, refresh_token=refresh_token, user=user)


@app.post("/auth/refresh", response_model=schemas.TokenOut)
@limiter.limit("20/minute")
def refresh_token(request: Request, refresh_token: str, db: Session = Depends(get_db)):
    stored_token = verify_refresh_token(db, refresh_token)
    if not stored_token:
        raise HTTPException(401, "Refresh token недействителен или истёк")

    user = db.query(models.User).filter(models.User.id == stored_token.user_id).first()
    if not user:
        raise HTTPException(401, "Пользователь не найден")

    new_access_token = create_access_token(user.id, user.role.value)
    new_refresh_token, _ = rotate_refresh_token(db, stored_token)
    return schemas.TokenOut(access_token=new_access_token, refresh_token=new_refresh_token, user=user)


@app.post("/auth/logout")
@limiter.limit("20/minute")
def logout(request: Request, refresh_token: str, db: Session = Depends(get_db)):
    revoke_refresh_token(db, refresh_token)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        access_token = auth_header[7:]
        revoke_access_token(db, access_token)
    return {"ok": True, "message": "Успешный выход"}


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
    today = date_type.today()
    yesterday = today - timedelta(days=1)
    if entry_date > today:
        raise HTTPException(400, "Нельзя создавать записи на будущее")
    if entry_date < yesterday:
        raise HTTPException(400, "Можно редактировать только сегодняшний или вчерашний день")

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
    if user.role == models.Role.admin:
        return db.query(models.User).filter(models.User.role == models.Role.student).all()
    if not user.subject:
        return []
    taught_classes = db.query(models.ScheduleItem.class_num, models.ScheduleItem.class_letter).filter(
        models.ScheduleItem.subject == user.subject
    ).distinct().all()
    if not taught_classes:
        return []
    class_conditions = [
        (models.User.class_num == c[0]) & (models.User.class_letter == c[1])
        for c in taught_classes
    ]
    from sqlalchemy import or_
    return db.query(models.User).filter(
        models.User.role == models.Role.student,
        or_(*class_conditions)
    ).all()


@app.get("/students/{student_id}/entries", response_model=List[schemas.EntryOut])
def student_entries(
    student_id: str, days: int = 30,
    user: models.User = Depends(require_role("teacher", "admin")), db: Session = Depends(get_db),
):
    student = db.query(models.User).filter(
        models.User.id == student_id, models.User.role == models.Role.student
    ).first()
    if not student:
        raise HTTPException(404, "Ученик не найден")
    if not check_teacher_access_to_student(user, student, db):
        raise HTTPException(403, "Нет доступа к данным этого ученика")

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
    student = db.query(models.User).filter(
        models.User.id == student_id, models.User.role == models.Role.student
    ).first()
    if not student:
        raise HTTPException(404, "Ученик не найден")
    if not check_teacher_access_to_student(user, student, db):
        raise HTTPException(403, "Нет доступа к данным этого ученика")

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
    if user.role == models.Role.student:
        if not user.class_num or not user.class_letter:
            raise HTTPException(400, "Класс ученика не определён")
        target_class = user.class_num
        target_letter = user.class_letter
    elif user.role == models.Role.teacher:
        if not class_num or not class_letter:
            raise HTTPException(400, "Необходимо указать класс и букву")
        if not user.subject:
            raise HTTPException(403, "Учитель без привязанного предмета не может просматривать расписание")
        taught = db.query(models.ScheduleItem).filter(
            models.ScheduleItem.subject == user.subject,
            models.ScheduleItem.class_num == class_num,
            models.ScheduleItem.class_letter == class_letter
        ).first()
        if not taught:
            raise HTTPException(403, "Нет доступа к расписанию этого класса")
        target_class = class_num
        target_letter = class_letter
    elif user.role == models.Role.admin:
        if not class_num or not class_letter:
            raise HTTPException(400, "Необходимо указать класс и букву")
        target_class = class_num
        target_letter = class_letter
    else:
        raise HTTPException(403, "Недостаточно прав")

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
    if user.role == models.Role.teacher:
        if not user.subject:
            raise HTTPException(403, "Учитель без предмета не может создавать расписание")
        if payload.subject != user.subject:
            raise HTTPException(403, "Можно создавать расписание только для своего предмета")
        taught = db.query(models.ScheduleItem).filter(
            models.ScheduleItem.subject == user.subject,
            models.ScheduleItem.class_num == payload.class_num,
            models.ScheduleItem.class_letter == payload.class_letter
        ).first()
        if not taught:
            raise HTTPException(403, "Нет доступа к этому классу")
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
    if user.role == models.Role.teacher:
        if not user.subject:
            raise HTTPException(403, "Учитель без предмета не может удалять расписание")
        if item.subject != user.subject:
            raise HTTPException(403, "Можно удалять только занятия своего предмета")
        taught = db.query(models.ScheduleItem).filter(
            models.ScheduleItem.subject == user.subject,
            models.ScheduleItem.class_num == item.class_num,
            models.ScheduleItem.class_letter == item.class_letter
        ).first()
        if not taught:
            raise HTTPException(403, "Нет доступа к этому классу")
    db.delete(item)
    db.commit()
    return {"ok": True}


# ---------- homeworks ----------
@app.get("/homeworks", response_model=List[schemas.HomeworkOut])
def get_homeworks(
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role == models.Role.student:
        target_class = user.class_num or "10"
        target_letter = user.class_letter or "A"
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
    elif user.role == models.Role.teacher:
        if not user.subject:
            return []
        taught_classes = db.query(models.ScheduleItem.class_num, models.ScheduleItem.class_letter).filter(
            models.ScheduleItem.subject == user.subject
        ).distinct().all()
        if not taught_classes:
            return []
        class_conditions = [
            (models.Homework.class_num == c[0]) & (models.Homework.class_letter == c[1])
            for c in taught_classes
        ]
        from sqlalchemy import or_
        hws = db.query(models.Homework).filter(
            or_(*class_conditions)
        ).order_by(models.Homework.due_date.asc()).all()
        return [schemas.HomeworkOut.from_orm(hw) for hw in hws]
    else:
        hws = db.query(models.Homework).order_by(models.Homework.due_date.asc()).all()
        return [schemas.HomeworkOut.from_orm(hw) for hw in hws]


@app.post("/homeworks", response_model=schemas.HomeworkOut)
def create_homework(
    payload: schemas.HomeworkIn,
    user: models.User = Depends(require_role("teacher", "admin")),
    db: Session = Depends(get_db),
):
    if user.role == models.Role.teacher:
        if not user.subject:
            raise HTTPException(403, "Учитель без предмета не может создавать ДЗ")
        if payload.subject != user.subject:
            raise HTTPException(403, "Можно создавать ДЗ только для своего предмета")
        taught = db.query(models.ScheduleItem).filter(
            models.ScheduleItem.subject == user.subject,
            models.ScheduleItem.class_num == payload.class_num,
            models.ScheduleItem.class_letter == payload.class_letter
        ).first()
        if not taught:
            raise HTTPException(403, "Нет доступа к этому классу")
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
    hw = db.query(models.Homework).filter(models.Homework.id == homework_id).first()
    if not hw:
        raise HTTPException(404, "Домашнее задание не найдено")
    if not user.class_num or not user.class_letter:
        raise HTTPException(400, "Класс ученика не определён")
    if hw.class_num != user.class_num or hw.class_letter != user.class_letter:
        raise HTTPException(403, "Нет доступа к этому заданию")

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
def ranking(days: int = 7, db: Session = Depends(get_db), user: models.User = Depends(require_role("teacher", "admin"))):
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

