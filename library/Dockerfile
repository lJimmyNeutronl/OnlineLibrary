# Multi-stage build для Spring Boot приложения
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Установка рабочей директории
WORKDIR /app

# Копирование файлов Maven
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
COPY mvnw.cmd .

# Загрузка зависимостей (кэширование слоя)
RUN mvn dependency:go-offline -B

# Копирование исходного кода
COPY src ./src

# Сборка приложения
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

# Установка curl для health checks
RUN apk add --no-cache curl

# Создание непривилегированного пользователя
RUN addgroup -g 1001 -S spring && \
    adduser -u 1001 -S spring -G spring

# Установка рабочей директории
WORKDIR /app

# Копирование JAR файла из build stage
COPY --from=build /app/target/*.jar app.jar

# Изменение владельца файлов
RUN chown -R spring:spring /app

# Переключение на непривилегированного пользователя
USER spring

# Настройка JVM для контейнера
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Открытие порта
EXPOSE 8080

# Команда запуска
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"] 