from datetime import date as date_type
from typing import List, Optional
from pydantic import BaseModel, EmailStr, field_validator, model_validator


def validate_password(password: str) -> str:
    if len(password) < 8:
        raise ValueError("Пароль должен содержать минимум 8 символов")
    if len(password) > 72:
        raise ValueError("Пароль не должен превышать 72 символа (ограничение bcrypt)")
    if not any(c.islower() for c in password):
        raise ValueError("Пароль должен содержать хотя бы одну строчную букву")
    if not any(c.isupper() for c in password):
        raise ValueError("Пароль должен содержать хотя бы одну заглавную букву")
    if not any(c.isdigit() for c in password):
        raise ValueError("Пароль должен содержать хотя бы одну цифру")
    return password


class RegisterRequest(BaseModel):
    role: str
    name: str
    email: EmailStr
    password: str
    school: Optional[str] = ""
    city: Optional[str] = ""
    class_num: Optional[str] = None
    class_letter: Optional[str] = None
    subject: Optional[str] = None

    _validate_password = field_validator("password", mode="before")(validate_password)


class UserOut(BaseModel):
    id: str
    role: str
    name: str
    email: EmailStr
    school: str
    city: str
    class_num: Optional[str] = None
    class_letter: Optional[str] = None
    subject: Optional[str] = None

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class EntryIn(BaseModel):
    date: Optional[date_type] = None
    homework_done: bool = False
    lessons_count: int = 0
    tasks_done: int = 0
    avg_grade: float = 0
    prep_time_min: int = 0
    ent_prep_min: int = 0
    reading_min: int = 0
    self_study_min: int = 0
    goals_percent: float = 0
    attended: bool = True
    late: bool = False
    absent: bool = False
    extra_activities: List[str] = []
    sleep_hours: float = 7.5
    mood: int = 3
    wellbeing: int = 3

    @field_validator("avg_grade")
    @classmethod
    def validate_avg_grade(cls, v):
        if v < 0 or v > 100:
            raise ValueError("avg_grade должен быть от 0 до 100")
        return v

    @field_validator("lessons_count")
    @classmethod
    def validate_lessons_count(cls, v):
        if v < 0 or v > 20:
            raise ValueError("lessons_count должен быть от 0 до 20")
        return v

    @field_validator("tasks_done")
    @classmethod
    def validate_tasks_done(cls, v):
        if v < 0 or v > 100:
            raise ValueError("tasks_done должен быть от 0 до 100")
        return v

    @field_validator("prep_time_min", "ent_prep_min", "reading_min", "self_study_min")
    @classmethod
    def validate_time_min(cls, v):
        if v < 0 or v > 1000:
            raise ValueError("Значение должно быть от 0 до 1000 минут")
        return v

    @field_validator("goals_percent")
    @classmethod
    def validate_goals_percent(cls, v):
        if v < 0 or v > 100:
            raise ValueError("goals_percent должен быть от 0 до 100")
        return v

    @field_validator("sleep_hours")
    @classmethod
    def validate_sleep_hours(cls, v):
        if v < 0 or v > 24:
            raise ValueError("sleep_hours должен быть от 0 до 24")
        return v

    @field_validator("mood", "wellbeing")
    @classmethod
    def validate_mood_wellbeing(cls, v):
        if v < 1 or v > 5:
            raise ValueError("Значение должно быть от 1 до 5")
        return v

    @model_validator(mode="after")
    def validate_attendance_consistency(self):
        if self.absent and (self.attended or self.late):
            raise ValueError("Если absent=True, то attended и late должны быть False")
        if self.late and self.absent:
            raise ValueError("late и absent не могут быть одновременно True")
        return self


class TeacherUpdateIn(BaseModel):
    date: date_type
    avg_grade: Optional[float] = None
    attendance_mark: Optional[str] = None  # "present" | "late" | "absent"
    homework_checked: Optional[bool] = None
    remark: Optional[str] = None

    @field_validator("avg_grade")
    @classmethod
    def validate_avg_grade(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError("avg_grade должен быть от 0 до 100")
        return v

    @field_validator("attendance_mark")
    @classmethod
    def validate_attendance_mark(cls, v):
        if v is not None and v not in ("present", "late", "absent"):
            raise ValueError("attendance_mark должен быть: present, late или absent")
        return v


class EntryOut(EntryIn):
    id: str
    student_id: str
    productivity: int
    stars: int
    teacher_homework_checked: Optional[bool] = None
    teacher_remark: Optional[str] = ""
    teacher_grade_set: bool = False

    class Config:
        from_attributes = True


class RankingRow(BaseModel):
    student_id: str
    name: str
    class_num: Optional[str] = ""
    class_letter: Optional[str] = ""
    avg_productivity: int
    stars: int = 1
    entries_count: int = 0


class ScheduleItemIn(BaseModel):
    class_num: str
    class_letter: str
    day_of_week: int  # 0..6
    lesson_num: int
    time_slot: str = ""
    subject: str
    room: str = ""
    teacher_name: str = ""


class ScheduleItemOut(ScheduleItemIn):
    id: str

    class Config:
        from_attributes = True


class HomeworkIn(BaseModel):
    class_num: str
    class_letter: str
    subject: str
    title: str
    description: str = ""
    due_date: date_type


class HomeworkOut(HomeworkIn):
    id: str
    created_at: date_type
    created_by: Optional[str] = None
    completed: bool = False

    class Config:
        from_attributes = True


class UserRoleUpdate(BaseModel):
    role: str

