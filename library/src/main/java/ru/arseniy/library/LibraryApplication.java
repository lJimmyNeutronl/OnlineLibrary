package ru.arseniy.library;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
public class LibraryApplication {

	public static void main(String[] args) {
		SpringApplication application = new SpringApplication(LibraryApplication.class);
		application.run(args);
	}

}
