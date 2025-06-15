-- Инициализационный скрипт для PostgreSQL базы данных онлайн-библиотеки
-- Этот файл выполнится автоматически при первом запуске контейнера PostgreSQL

SET CLIENT_ENCODING TO 'UTF8';


GRANT ALL PRIVILEGES ON DATABASE onlinelibrary TO arseniy;

ALTER DATABASE onlinelibrary OWNER TO arseniy;

DO $$
BEGIN
    RAISE NOTICE 'Database onlinelibrary initialized successfully!';
    RAISE NOTICE 'User arseniy has been granted all privileges.';
    RAISE NOTICE 'Flyway migrations will be applied automatically by Spring Boot.';
END $$; 