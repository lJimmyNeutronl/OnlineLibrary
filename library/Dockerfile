# Dockerfile для Spring Boot приложения
# Multi-stage build для оптимизации размера образа

# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Копируем файлы Maven для кеширования зависимостей
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
COPY mvnw.cmd .

# Скачиваем зависимости (будет закешировано, если pom.xml не изменился)
RUN ./mvnw dependency:go-offline -B

# Копируем исходный код
COPY src src

# Собираем приложение
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S spring && \
    adduser -u 1001 -S spring -G spring

# Копируем JAR файл из stage build
COPY --from=build /app/target/*.jar app.jar

# Устанавливаем владельца файлов
RUN chown spring:spring app.jar

# Переключаемся на пользователя spring
USER spring

# Открываем порт
EXPOSE 8080

# Настройки JVM для контейнера
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Команда запуска
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"] 