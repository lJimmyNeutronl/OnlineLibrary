#!/bin/bash

echo "Остановка приложения (если запущено)"
pkill -f "java.*library"

echo "Удаление базы данных"
sudo -u postgres psql -c "DROP DATABASE IF EXISTS onlinelibrary;"

echo "Создание новой базы данных"
sudo -u postgres psql -c "CREATE DATABASE onlinelibrary;"

echo "Назначение привилегий"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE onlinelibrary TO arseniy;"

echo "Назначение привилегий на схему public"
sudo -u postgres psql -d onlinelibrary -c "GRANT ALL PRIVILEGES ON SCHEMA public TO arseniy;"

echo "База данных сброшена и создана заново"
echo "Теперь можно запустить приложение: ./mvnw spring-boot:run" 