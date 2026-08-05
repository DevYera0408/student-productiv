from datetime import date, timedelta

from . import models


def calc_productivity(e: models.Entry) -> int:
    """Same weighted formula as the frontend: 30/20/15/15/10/10."""
    academic = _clamp(
        (_clamp(e.avg_grade) + (_clamp((e.tasks_done / e.lessons_count) * 100) if e.lessons_count else 0)) / 2
    )
    if e.teacher_homework_checked is not None:
        homework = 100 if e.teacher_homework_checked else 0
    else:
        homework = 100 if e.homework_done else 0
    attendance = 0 if e.absent else (70 if e.late else 100)
    ent_prep = _clamp((e.ent_prep_min / 90) * 100)
    extra = _clamp((len(e.extra_activities or []) / 2) * 100)
    sleep_score = _clamp(100 - abs((e.sleep_hours or 7.5) - 8) * 15)
    mood_score = _clamp(((e.mood or 3) / 5) * 100)
    well_score = _clamp(((e.wellbeing or 3) / 5) * 100)
    routine = (sleep_score + mood_score + well_score) / 3

    total = (
        academic * 0.30 + homework * 0.20 + attendance * 0.15
        + ent_prep * 0.15 + extra * 0.10 + routine * 0.10
    )
    return round(_clamp(total))


def stars_for(score: int) -> int:
    if score >= 95:
        return 5
    if score >= 85:
        return 4
    if score >= 70:
        return 3
    if score >= 50:
        return 2
    return 1


def _clamp(n) -> float:
    try:
        n = float(n)
    except (TypeError, ValueError):
        n = 0
    return max(0.0, min(100.0, n))


def last_n_dates(n: int = 7):
    today = date.today()
    return [today - timedelta(days=i) for i in range(n - 1, -1, -1)]
