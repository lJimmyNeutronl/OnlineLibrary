#!/bin/bash

echo "🚀 Запуск онлайн библиотеки..."

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден. Создаю из примера..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Файл .env создан. Отредактируйте его перед запуском!"
        echo "📝 Особенно важно настроить Yandex Cloud параметры:"
        echo "   - YANDEX_BUCKET"
        echo "   - YANDEX_ACCESS_KEY" 
        echo "   - YANDEX_SECRET_KEY"
        exit 1
    else
        echo "❌ Файл .env.example не найден!"
        exit 1
    fi
fi

echo "🔧 Останавливаем существующие контейнеры..."
docker-compose down

echo "🏗️  Собираем образы..."
docker-compose build

echo "🚀 Запускаем контейнеры..."
docker-compose up -d

echo "⏳ Ждем запуска сервисов..."
sleep 10

echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "🎉 Приложение запущено!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8080/api"
echo "🗄️  PostgreSQL: localhost:5433"
echo ""
echo "👑 Суперадмин по умолчанию:"
echo "   Email: superadmin@library.com"
echo "   Password: SuperAdmin123!"
echo ""
echo "📋 Полезные команды:"
echo "   docker-compose logs -f          # Просмотр логов"
echo "   docker-compose down             # Остановка"
echo "   docker-compose restart backend  # Перезапуск backend" 