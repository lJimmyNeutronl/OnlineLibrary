package ru.arseniy.library.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.core.retry.RetryPolicy;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;

import java.net.URI;
import java.time.Duration;

/**
 * Конфигурация для подключения к S3-совместимому хранилищу
 */
@Configuration
@Slf4j
public class S3Config {

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.s3.endpoint}")
    private String endpoint;

    @Value("${aws.s3.access-key}")
    private String accessKey;

    @Value("${aws.s3.secret-key}")
    private String secretKey;

    @Value("${aws.s3.path-style-access-enabled:false}")
    private boolean pathStyleAccessEnabled;

    @Value("${aws.s3.force-path-style:false}")
    private boolean forcePathStyle;

    /**
     * Создает и настраивает клиент для работы с S3
     *
     * @return настроенный S3Client
     */
    @Bean
    public S3Client s3Client() {
        log.info("Инициализация S3Client с endpoint: {}, region: {}", endpoint, region);
        
        // Настраиваем политику повторных попыток для повышения надежности
        RetryPolicy retryPolicy = RetryPolicy.builder()
                .numRetries(3)
                .build();
                
        // Добавляем дополнительные настройки для клиента
        ClientOverrideConfiguration clientConfig = ClientOverrideConfiguration.builder()
                .apiCallTimeout(Duration.ofSeconds(30))
                .retryPolicy(retryPolicy)
                .build();
        
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .overrideConfiguration(clientConfig);

        // Если указан endpoint, используем его (для Яндекс.Облака или других совместимых сервисов)
        if (endpoint != null && !endpoint.isEmpty()) {
            log.info("Используем кастомный endpoint: {}", endpoint);
            builder.endpointOverride(URI.create(endpoint));
        }

        // Для совместимых сервисов (Яндекс.Облако, MinIO) часто требуется path-style доступ
        if (pathStyleAccessEnabled || forcePathStyle) {
            log.info("Включаем path-style access");
            builder.serviceConfiguration(s -> s.pathStyleAccessEnabled(true));
        }

        S3Client client = builder.build();
        log.info("S3Client успешно инициализирован");
        return client;
    }
}
