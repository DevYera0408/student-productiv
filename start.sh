#!/bin/zsh

echo "🚀 Запуск Student Productivity Platform..."

PROJECT_DIR="/home/eraly/Документы/student-productivity"


echo "🔧 Запуск Backend..."

ptyxis -- zsh -c "
cd '$PROJECT_DIR/backend'
source venv/bin/activate
uvicorn app.main:app --reload
exec zsh
" &


sleep 2


echo "🎨 Запуск Frontend..."

ptyxis -- zsh -c "
cd '$PROJECT_DIR/frontend'
npm run dev
exec zsh
" &


echo "✅ Проект запущен!"
