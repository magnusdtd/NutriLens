package com.nutrilens.nutrilens_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class NutrilensBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(NutrilensBackendApplication.class, args);
	}

}
