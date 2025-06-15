# Dockerfile для React + Vite приложения
# Multi-stage build для оптимизации размера образа

# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Копируем package.json и package-lock.json для кеширования зависимостей
COPY package*.json ./

# Очищаем npm cache и устанавливаем зависимости
RUN npm cache clean --force && \
    npm install

# Копируем исходный код
COPY . .

# Собираем приложение для production (только Vite без TypeScript проверки)
RUN npx vite build

# Stage 2: Runtime (Nginx для раздачи статических файлов)
FROM nginx:alpine

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Копируем собранное приложение из build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Создаем скрипт для подстановки переменных окружения
RUN cat > /docker-entrypoint.sh << 'EOF'
#!/bin/sh
set -e

# Подставляем переменные окружения в JavaScript файлы
if [ -n "${VITE_API_URL}" ]; then
    echo "Setting VITE_API_URL to: ${VITE_API_URL}"
    find /usr/share/nginx/html -name "*.js" -exec sed -i "s|http://localhost:8080/api|${VITE_API_URL}|g" {} \;
fi

# Запускаем nginx
exec "$@"
EOF

RUN chmod +x /docker-entrypoint.sh

# Открываем порт
EXPOSE 80

# Настройка entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"] 