# 🐳 Запуск онлайн библиотеки через Docker

## Быстрый старт

1. **Клонируйте репозиторий и перейдите в директорию:**
```bash
cd OnlineLibrary
```

2. **Создайте файл `.env` на основе примера:**
```bash
cp .env.example .env
```

3. **Отредактируйте `.env` файл** (особенно настройки Yandex Cloud):
```bash
nano .env
```

4. **Запустите приложение:**
```bash
docker-compose up -d
```

5. **Проверьте статус контейнеров:**
```bash
docker-compose ps
```

## Доступ к приложению

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **PostgreSQL**: localhost:5433

## Переменные окружения

### Обязательные для настройки:

```env
# Yandex Cloud Object Storage
YANDEX_BUCKET=your-actual-bucket-name
YANDEX_ACCESS_KEY=your-actual-access-key
YANDEX_SECRET_KEY=your-actual-secret-key
```

### Опциональные (имеют значения по умолчанию):

```env
# Database
POSTGRES_DB=library_db
POSTGRES_USER=library_user
POSTGRES_PASSWORD=library_password_123

# JWT
JWT_SECRET=mySecretKey123456789012345678901234567890
JWT_EXPIRATION_MS=86400000

# CORS (разделенные запятой)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://frontend

# Frontend
VITE_API_URL=/api
```

## Полезные команды

### Просмотр логов:
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Перезапуск сервисов:
```bash
# Все сервисы
docker-compose restart

# Конкретный сервис
docker-compose restart backend
```

### Остановка и удаление:
```bash
# Остановить
docker-compose down

# Остановить и удалить volumes (ВНИМАНИЕ: удалит данные БД!)
docker-compose down -v
```

### Пересборка образов:
```bash
# Пересобрать все
docker-compose build --no-cache

# Пересобрать конкретный сервис
docker-compose build --no-cache backend
```

## Решение проблем

### 1. Ошибки сборки frontend (ESLint)
Если сборка падает из-за ошибок линтера, они будут проигнорированы автоматически.

### 2. Проблемы с CORS
Убедитесь, что в `CORS_ALLOWED_ORIGINS` указаны правильные URL:
```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://frontend,https://yourdomain.com
```

### 3. Проблемы с базой данных
```bash
# Проверить статус PostgreSQL
docker-compose exec postgres pg_isready -U library_user -d library_db

# Подключиться к БД
docker-compose exec postgres psql -U library_user -d library_db
```

### 4. Проблемы с файлами (Yandex Cloud)
Убедитесь, что настройки Yandex Cloud Object Storage корректны в `.env` файле.

## Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   (React)       │    │  (Spring Boot)  │    │                 │
│   Port: 5173    │◄──►│   Port: 8080    │◄──►│   Port: 5433    │
│   (Nginx)       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Docker Network  │
                    │ library-network │
                    └─────────────────┘
```

## Первый запуск

После первого запуска в системе будет создан суперадминистратор:
- **Username**: superadmin
- **Email**: superadmin@library.com
- **Password**: SuperAdmin123!

⚠️ **Обязательно смените пароль после первого входа!** 