# ==========================================================
# CampusHire Backend Dockerfile
# Production-grade container for Spring Boot 3.3.4 (Java 21)
# ==========================================================

# Step 1: Use minimal, secure Eclipse Temurin JRE on Alpine
FROM eclipse-temurin:21-jre-alpine

# Set working directory
WORKDIR /app

# Install curl for container health check
RUN apk add --no-cache curl

# Create non-root system group and user for security
RUN addgroup -S campushire && adduser -S campushire -G campushire

# Copy pre-packaged executable Spring Boot JAR
COPY target/campushire-backend.jar app.jar

# Ensure proper permissions
RUN chown -R campushire:campushire /app

# Switch to non-root user
USER campushire

# Expose standard application port
EXPOSE 8080

# Configure JVM memory limits and entrypoint
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
