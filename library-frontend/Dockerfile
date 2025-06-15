# Multi-stage build для React приложения
FROM node:20-alpine AS build

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей (обновляем package-lock.json если нужно)
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка приложения для production (пропускаем TypeScript проверки)
RUN npx vite build --mode production

# Production stage с Nginx
FROM nginx:alpine

# Установка curl для health checks
RUN apk add --no-cache curl

# Удаление стандартной конфигурации Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копирование кастомной конфигурации Nginx
COPY nginx.conf /etc/nginx/conf.d/

# Копирование собранного приложения
COPY --from=build /app/dist /usr/share/nginx/html

# Создание скрипта для подстановки переменных окружения
RUN echo '#!/bin/sh' > /docker-entrypoint.d/30-substitute-env.sh && \
    echo 'set -e' >> /docker-entrypoint.d/30-substitute-env.sh && \
    echo 'echo "Substituting environment variables..."' >> /docker-entrypoint.d/30-substitute-env.sh && \
    echo 'find /usr/share/nginx/html -name "*.js" -exec sed -i "s|VITE_API_URL_PLACEHOLDER|${VITE_API_URL}|g" {} \;' >> /docker-entrypoint.d/30-substitute-env.sh && \
    echo 'echo "Environment variables substituted successfully"' >> /docker-entrypoint.d/30-substitute-env.sh && \
    chmod +x /docker-entrypoint.d/30-substitute-env.sh

# Создание health check endpoint
RUN echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body><h1>OK</h1></body></html>' > /usr/share/nginx/html/health

# Открытие порта
EXPOSE 80

# Nginx запускается автоматически через базовый образ 