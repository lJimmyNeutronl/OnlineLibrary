-- Инициализация базы данных для онлайн-библиотеки
-- Этот файл выполняется при первом запуске PostgreSQL контейнера

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Установка часового пояса
SET timezone = 'Europe/Moscow';

-- Создание пользователя приложения (если не существует)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'arseniy') THEN
        CREATE USER arseniy WITH PASSWORD 'password';
    END IF;
END
$$;

-- Предоставление прав пользователю
GRANT ALL PRIVILEGES ON DATABASE onlinelibrary TO arseniy; 