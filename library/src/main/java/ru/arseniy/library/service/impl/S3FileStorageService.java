package ru.arseniy.library.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.arseniy.library.service.FileStorageService;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import org.springframework.context.annotation.Primary;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;

/**
 * Реализация сервиса хранения файлов с использованием AWS S3
 */
@Service
@Primary
@RequiredArgsConstructor
@Slf4j
public class S3FileStorageService implements FileStorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.endpoint:}")
    private String endpoint;
    
    @Value("${aws.s3.public-url:}")
    private String publicUrl;

    @Override
    public String uploadFile(MultipartFile file, String key) throws IOException {
        log.info("Начинаем загрузку файла: {}, размер: {}, тип: {}", key, file.getSize(), file.getContentType());
        try (InputStream inputStream = file.getInputStream()) {
            return uploadFile(inputStream, key, file.getContentType(), file.getSize());
        }
    }
    
    @Override
    public String uploadFile(MultipartFile file, String key, String bookTitle) throws IOException {
        log.info("Начинаем загрузку файла: {}, размер: {}, тип: {}, книга: {}", key, file.getSize(), file.getContentType(), bookTitle);
        try (InputStream inputStream = file.getInputStream()) {
            return uploadFile(inputStream, key, file.getContentType(), file.getSize(), bookTitle);
        }
    }

    @Override
    public String uploadFile(InputStream inputStream, String key, String contentType, long contentLength) throws IOException {
        return uploadFile(inputStream, key, contentType, contentLength, null);
    }
    
    @Override
    public String uploadFile(InputStream inputStream, String key, String contentType, long contentLength, String bookTitle) throws IOException {
        try {
            log.info("Подготовка к загрузке файла в S3: ключ={}, тип={}, размер={}, книга={}", key, contentType, contentLength, bookTitle);
            
            // Проверяем существование бакета, если нет - создаем
            try {
                createBucketIfNotExists();
            } catch (Exception e) {
                log.error("Ошибка при проверке или создании бакета: {}", e.getMessage(), e);
                throw new IOException("Ошибка при проверке или создании бакета: " + e.getMessage(), e);
            }
            
            // Если указано название книги, создаем структуру папок
            if (bookTitle != null && !bookTitle.isEmpty()) {
                // Заменяем недопустимые символы в имени книги
                String safeBookTitle = bookTitle.replaceAll("[^a-zA-Z0-9_\\-\\.]", "_");
                
                // Извлекаем имя файла из ключа
                String fileName = key;
                if (key.contains("/")) {
                    fileName = key.substring(key.lastIndexOf("/") + 1);
                }
                
                // Формируем новый ключ, включающий название книги как папку
                key = "books/" + safeBookTitle + "/" + fileName;
                log.info("Сформирован новый ключ с учетом названия книги: {}", key);
            }

            // Копируем данные из входного потока
            byte[] bytes;
            try {
                bytes = IOUtils.toByteArray(inputStream);
                log.info("Данные скопированы из потока, размер: {} байт", bytes.length);
            } catch (IOException e) {
                log.error("Ошибка при чтении данных из потока: {}", e.getMessage(), e);
                throw new IOException("Ошибка при чтении данных из потока: " + e.getMessage(), e);
            }

            // Загружаем файл в S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .build();

            log.info("Отправляем запрос на загрузку файла в бакет: {}, ключ: {}, endpoint: {}", 
                    bucketName, key, endpoint != null ? endpoint : "default");
            try {
                s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes));
                log.info("Файл успешно загружен в S3: {}", key);
            } catch (S3Exception e) {
                log.error("Ошибка S3 при загрузке файла: code={}, statusCode={}, requestId={}, message={}", 
                        e.awsErrorDetails().errorCode(), 
                        e.awsErrorDetails().sdkHttpResponse().statusCode(),
                        e.requestId(),
                        e.getMessage(), e);
                throw new IOException("Ошибка S3 при загрузке файла в хранилище: " + e.getMessage() + 
                        ", code=" + e.awsErrorDetails().errorCode() + 
                        ", statusCode=" + e.awsErrorDetails().sdkHttpResponse().statusCode() + 
                        ", requestId=" + e.requestId(), e);
            }

            String fileUrl = getFileUrl(key);
            log.info("Сгенерирован URL для файла: {}", fileUrl);
            return fileUrl;
        } catch (S3Exception e) {
            log.error("Ошибка S3 при загрузке файла: code={}, statusCode={}, requestId={}, message={}", 
                    e.awsErrorDetails().errorCode(), 
                    e.awsErrorDetails().sdkHttpResponse().statusCode(),
                    e.requestId(),
                    e.getMessage(), e);
            throw new IOException("Ошибка S3 при загрузке файла в хранилище: " + e.getMessage() + 
                    ", code=" + e.awsErrorDetails().errorCode() + 
                    ", statusCode=" + e.awsErrorDetails().sdkHttpResponse().statusCode() + 
                    ", requestId=" + e.requestId(), e);
        } catch (Exception e) {
            log.error("Неожиданная ошибка при загрузке файла: {} - {}", e.getMessage(), e.getClass().getName(), e);
            throw new IOException("Неожиданная ошибка при загрузке файла: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<InputStream> getFile(String key) {
        log.info("Запрос на получение файла по ключу: {}", key);
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            log.info("Отправка запроса в S3 для получения файла: bucket={}, key={}", bucketName, key);
            InputStream fileStream = s3Client.getObject(getObjectRequest);
            log.info("Файл успешно получен из S3: {}", key);
            return Optional.of(fileStream);
        } catch (NoSuchKeyException e) {
            log.warn("Файл не найден в S3: bucket={}, key={}", bucketName, key);
            return Optional.empty();
        } catch (S3Exception e) {
            log.error("Ошибка при получении файла из S3: statusCode={}, errorCode={}, requestId={}, message={}",
                    e.awsErrorDetails().sdkHttpResponse().statusCode(),
                    e.awsErrorDetails().errorCode(),
                    e.requestId(),
                    e.getMessage(), e);
            return Optional.empty();
        } catch (Exception e) {
            log.error("Неожиданная ошибка при получении файла из S3: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }

    @Override
    public boolean deleteFile(String key) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("Файл успешно удален из S3: {}", key);
            return true;
        } catch (S3Exception e) {
            log.error("Ошибка при удалении файла из S3: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public String getFileUrl(String key) {
        // Если указан publicUrl, используем его для формирования URL (для Яндекс.Облака)
        if (publicUrl != null && !publicUrl.isEmpty()) {
            // Для Яндекс.Облака URL уже содержит имя бакета
            return String.format("%s/%s", publicUrl, key);
        }
        // Если указан endpoint, используем его для формирования URL
        else if (endpoint != null && !endpoint.isEmpty()) {
            // Для Яндекс.Облака формат URL: https://storage.yandexcloud.net/bucket-name/key
            return String.format("%s/%s/%s", endpoint, bucketName, key);
        }
        
        // Иначе используем стандартный URL формат AWS S3
        return String.format("https://%s.s3.amazonaws.com/%s", bucketName, key);
    }

    /**
     * Создает бакет, если он не существует
     */
    private void createBucketIfNotExists() {
        try {
            log.info("Проверяем существование бакета: {}", bucketName);
            HeadBucketRequest headBucketRequest = HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build();
            
            s3Client.headBucket(headBucketRequest);
            log.info("Бакет {} существует", bucketName);
        } catch (NoSuchBucketException e) {
            log.info("Бакет {} не существует, создаем...", bucketName);
            try {
                CreateBucketRequest createBucketRequest = CreateBucketRequest.builder()
                        .bucket(bucketName)
                        .build();
                
                s3Client.createBucket(createBucketRequest);
                log.info("Бакет {} успешно создан", bucketName);
                
                // Делаем бакет публичным для чтения
                try {
                    PublicAccessBlockConfiguration publicAccessBlockConfiguration = PublicAccessBlockConfiguration.builder()
                            .blockPublicAcls(false)
                            .ignorePublicAcls(false)
                            .blockPublicPolicy(false)
                            .restrictPublicBuckets(false)
                            .build();
                    
                    PutPublicAccessBlockRequest publicAccessBlockRequest = PutPublicAccessBlockRequest.builder()
                            .bucket(bucketName)
                            .publicAccessBlockConfiguration(publicAccessBlockConfiguration)
                            .build();
                    
                    s3Client.putPublicAccessBlock(publicAccessBlockRequest);
                    log.info("Публичный доступ для бакета {} настроен", bucketName);
                } catch (Exception inner) {
                    log.warn("Не удалось настроить публичный доступ для бакета: {}", inner.getMessage(), inner);
                }
            } catch (S3Exception createException) {
                log.error("Ошибка при создании бакета: {}", createException.getMessage(), createException);
                throw createException; // Пробрасываем ошибку выше
            }
        } catch (S3Exception e) {
            log.error("Ошибка при проверке бакета: {} - {}", e.getMessage(), e.getClass().getName(), e);
            throw e; // Пробрасываем ошибку выше, чтобы избежать молчаливого игнорирования проблем
        }
    }
}
