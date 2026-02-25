# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
# Grant execution permissions to the wrapper
RUN chmod +x mvnw
# Skip tests to speed up build and avoid environment dependency issues during build
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Environment variables with default values
ENV SPRING_PROFILES_ACTIVE=prod

# Run with memory limits for Free Tier (Render/Railway have 512MB RAM)
# -Xmx350m: Max heap size 350MB (leaving ~150MB for OS/JVM overhead)
ENTRYPOINT ["java", "-Xmx350m", "-jar", "app.jar"]
