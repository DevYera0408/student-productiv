# Student Productivity Platform 🎓

Веб-платформа для повышения продуктивности студентов.  
Проект помогает ученикам управлять учебой, отслеживать прогресс, посещаемость и планировать задачи.

## 🚀 Возможности

- 🔐 Регистрация и авторизация пользователей
- 👤 Личный кабинет студента
- 📚 Управление учебными задачами
- 📊 Аналитика продуктивности
- 📈 Отслеживание прогресса обучения
- ✅ Учет посещаемости
- 🌍 Поддержка русского и казахского языков
- 🔒 JWT-аутентификация
- 📱 Адаптивный интерфейс

## 🛠 Технологии

### Frontend

- React 19
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Axios
- Framer Motion
- Recharts
- Lucide React
- shadcn/ui

### Backend

- FastAPI
- Python
- SQLAlchemy
- PostgreSQL
- Alembic
- Pydantic
- JWT Authentication
- bcrypt
- CORS

## 📂 Структура проекта
student-productivity/

├── backend/
│ ├── app/
│ │ ├── api/
│ │ ├── models/
│ │ ├── schemas/
│ │ ├── services/
│ │ └── main.py
│ ├── alembic/
│ ├── requirements.txt
│ └── .env

├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── assets/
│ │ └── App.jsx
│ ├── package.json
│ └── vite.config.js

└── README.md

## ⚙️ Установка

### Клонирование репозитория

```bash
git clone https://github.com/DevYera0408/student-productivity.git

cd student-productivity
Backend

Перейдите в папку:

cd backend

Создайте виртуальное окружение:

python3 -m venv venv

Активируйте:

Linux/macOS:

source venv/bin/activate

Windows:

venv\Scripts\activate

Установите зависимости:

pip install -r requirements.txt

Создайте файл .env:

DATABASE_URL=postgresql://user:password@localhost/student_productivity

SECRET_KEY=your_secret_key

ALGORITHM=HS256

Запуск сервера:

uvicorn app.main:app --reload

Backend будет доступен:

http://localhost:8000

Документация API:

http://localhost:8000/docs
Frontend

Перейдите:

cd frontend

Установите зависимости:

npm install

Запуск:

npm run dev

Frontend:

http://localhost:5173
🔑 API

Основные маршруты:

Авторизация
POST /auth/register
POST /auth/login
Пользователь
GET /users/me
Задачи
GET /tasks
POST /tasks
PUT /tasks/{id}
DELETE /tasks/{id}
Посещаемость
GET /attendance
POST /attendance
🖼 Скриншоты

Добавить после разработки:

screenshots/
├── dashboard.png
├── login.png
└── profile.png
🔮 Планы развития
 Мобильное приложение
 Уведомления
 AI-помощник для учебы
 Система достижений
 Командные группы студентов
 Интеграция с календарем
 Панель администратора
 Рейтинг продуктивности
🤝 Вклад в проект

Если хотите предложить улучшения:

Создайте Fork
Создайте новую ветку
git checkout -b feature/new-feature
Сделайте изменения
Создайте Pull Request
📄 Лицензия

MIT License

👨‍💻 Автор

DevYera0408

Проект создан для улучшения организации учебного процесса студентов.


После сохранения:

```bash
git add README.md
git commit -m "Add README"
git push
