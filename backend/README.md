# Backend для «Индекс продуктивности ученика»

FastAPI + SQLAlchemy. Локально работает на SQLite без настройки, в проде — на PostgreSQL через `DATABASE_URL`.

## 1. Запуск локально

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env               # при желании поменяйте SECRET_KEY
uvicorn app.main:app --reload --port 8000
```

Откройте `http://localhost:8000/docs` — там автоматическая Swagger-документация ко всем эндпоинтам, можно сразу потыкать без фронтенда.

## 2. Что уже реализовано

- `POST /auth/register`, `POST /auth/login` — регистрация/вход для ролей `student`, `teacher`, `admin`, JWT-токены
- `POST /entries` — ученик сохраняет свою запись за день (та же формула продуктивности 30/20/15/15/10/10, что и во фронтенде, теперь считается на сервере)
- `GET /entries/mine?days=7` — записи ученика за период
- `GET /students`, `GET /students/{id}/entries` — доступно учителю и админу
- `PUT /students/{id}/teacher-update` — учитель выставляет оценку/посещаемость/домашку/замечание
- `GET /ranking?days=7` — рейтинг класса
- `GET /admin/stats` — сводка по школе

## 3. PostgreSQL вместо SQLite

Поднимите базу (любой вариант):
- [Neon](https://neon.tech) или [Supabase](https://supabase.com) — бесплатный managed PostgreSQL, самый быстрый старт
- Свой сервер / Docker: `docker run -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres`

Затем задайте:
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```
Таблицы создаются автоматически при первом запуске (`Base.metadata.create_all`). Для продакшена позже стоит перейти на Alembic-миграции, но для старта этого достаточно.

## 4. Деплой backend

Любой из вариантов поднимет `uvicorn app.main:app`:
- **Railway** / **Render** — подключаете GitHub-репозиторий, задаёте `DATABASE_URL` и `SECRET_KEY` как переменные окружения, команда запуска `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Fly.io** — аналогично, через `fly.toml`

## 5. Подключение фронтенда

Артефакт, который я собрал раньше, работает только внутри Claude.ai (там нет доступа к интернету, только `window.storage`). Чтобы использовать этот backend, нужно вынести интерфейс за пределы Claude.ai:

1. Создайте обычное Vite-приложение: `npm create vite@latest school-app -- --template react`
2. Скопируйте туда компоненты из `school-productivity.jsx` (UI и формы остаются без изменений)
3. Замените все вызовы `loadDirectory / saveDirectory / loadStudentData / saveStudentData` на функции из `frontend-api-client-example.js` (там уже есть `register`, `login`, `saveTodayEntry`, `myEntries`, `listStudents`, `teacherUpdate`, `ranking`, `adminStats`)
4. Уберите расчёт `calcProductivity` из фронтенда (или оставьте только для мгновенного превью в форме) — сервер теперь возвращает готовое поле `productivity` и `stars` в каждой записи
5. Задайте `VITE_API_URL=https://ваш-backend-url` в `.env`
6. Задеплойте фронтенд на Vercel или Netlify (просто подключить репозиторий)

## 6. CORS

В `main.py` сейчас `allow_origins=["*"]` — подходит для разработки. Перед продакшеном замените на точный домен фронтенда:

```python
allow_origins=["https://your-frontend.vercel.app"]
```
