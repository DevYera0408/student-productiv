import enum
import uuid
from datetime import date as date_type

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Date, ForeignKey, JSON, Enum, UniqueConstraint
)
from sqlalchemy.orm import relationship

from .database import Base


def gen_id():
    return uuid.uuid4().hex[:12]


class Role(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_id)
    role = Column(Enum(Role), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    school = Column(String, default="")
    city = Column(String, default="")

    # student-only
    class_num = Column(String, nullable=True)
    class_letter = Column(String, nullable=True)

    # teacher-only
    subject = Column(String, nullable=True)

    entries = relationship("Entry", back_populates="student", cascade="all, delete-orphan")


class Entry(Base):
    __tablename__ = "entries"
    __table_args__ = (UniqueConstraint("student_id", "date", name="uq_student_date"),)

    id = Column(String, primary_key=True, default=gen_id)
    student_id = Column(String, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False, default=date_type.today)

    # учёба
    homework_done = Column(Boolean, default=False)
    lessons_count = Column(Integer, default=0)
    tasks_done = Column(Integer, default=0)
    avg_grade = Column(Float, default=0)

    # время
    prep_time_min = Column(Integer, default=0)
    ent_prep_min = Column(Integer, default=0)
    reading_min = Column(Integer, default=0)
    self_study_min = Column(Integer, default=0)

    # цели
    goals_percent = Column(Float, default=0)

    # посещаемость
    attended = Column(Boolean, default=True)
    late = Column(Boolean, default=False)
    absent = Column(Boolean, default=False)

    # доп активность
    extra_activities = Column(JSON, default=list)

    # режим
    sleep_hours = Column(Float, default=7.5)
    mood = Column(Integer, default=3)
    wellbeing = Column(Integer, default=3)

    # заполняется учителем, перекрывает соответствующие поля ученика
    teacher_homework_checked = Column(Boolean, nullable=True)
    teacher_remark = Column(String, default="")
    teacher_grade_set = Column(Boolean, default=False)

    student = relationship("User", back_populates="entries")
