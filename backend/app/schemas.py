from datetime import date
from typing import List, Optional
from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    role: str  # "student" | "teacher" | "admin"
    name: str
    email: EmailStr
    password: str
    school: Optional[str] = ""
    city: Optional[str] = ""
    class_num: Optional[str] = None
    class_letter: Optional[str] = None
    subject: Optional[str] = None


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
    token_type: str = "bearer"
    user: UserOut


class EntryIn(BaseModel):
    date: Optional[date] = None
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


class TeacherUpdateIn(BaseModel):
    date: date
    avg_grade: Optional[float] = None
    attendance_mark: Optional[str] = None  # "present" | "late" | "absent"
    homework_checked: Optional[bool] = None
    remark: Optional[str] = None


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
    due_date: date


class HomeworkOut(HomeworkIn):
    id: str
    created_at: date
    created_by: Optional[str] = None
    completed: bool = False

    class Config:
        from_attributes = True


class UserRoleUpdate(BaseModel):
    role: str

