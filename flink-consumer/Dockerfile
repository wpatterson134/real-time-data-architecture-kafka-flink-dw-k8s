# Stage 1: Build the application with Maven and OpenJDK 21
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Stage 2: Run the application with OpenJDK 21
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /app/target/flink-consumer-0.0.1-SNAPSHOT.jar /app/flink-consumer.jar

CMD ["java", "-jar", "flink-consumer.jar"]
