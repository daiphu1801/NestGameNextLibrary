package com.nestgame.config;

// DEPRECATED: CORS is now configured in SecurityConfig.java
// This class is kept for reference but disabled to avoid conflicts

/*
 * import org.springframework.beans.factory.annotation.Value;
 * import org.springframework.context.annotation.Bean;
 * import org.springframework.context.annotation.Configuration;
 * import org.springframework.web.cors.CorsConfiguration;
 * import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
 * import org.springframework.web.filter.CorsFilter;
 * 
 * import java.util.Arrays;
 * import java.util.Collections;
 * 
 * @Configuration
 * public class CorsConfig {
 * 
 * @Value("${application.frontend.url:http://localhost:3000}")
 * private String frontendUrl;
 * 
 * @Bean
 * public CorsFilter corsFilter() {
 * UrlBasedCorsConfigurationSource source = new
 * UrlBasedCorsConfigurationSource();
 * CorsConfiguration config = new CorsConfiguration();
 * 
 * config.setAllowCredentials(true);
 * config.setAllowedOrigins(Collections.singletonList(frontendUrl));
 * config.setAllowedHeaders(Arrays.asList(
 * "Origin",
 * "Content-Type",
 * "Accept",
 * "Authorization",
 * "Origin, Accept",
 * "X-Requested-With",
 * "Access-Control-Request-Method",
 * "Access-Control-Request-Headers"));
 * config.setExposedHeaders(Arrays.asList(
 * "Origin",
 * "Content-Type",
 * "Accept",
 * "Authorization",
 * "Access-Control-Allow-Origin",
 * "Access-Control-Allow-Credentials"));
 * config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE",
 * "OPTIONS", "PATCH"));
 * 
 * source.registerCorsConfiguration("/**", config);
 * return new CorsFilter(source);
 * }
 * }
 */
