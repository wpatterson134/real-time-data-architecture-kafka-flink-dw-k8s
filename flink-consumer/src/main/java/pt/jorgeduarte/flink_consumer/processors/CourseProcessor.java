package pt.jorgeduarte.flink_consumer.processors;

import com.google.gson.Gson;
import jakarta.annotation.PostConstruct;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import pt.jorgeduarte.flink_consumer.messages.CourseMessage;

import java.io.Serializable;
import java.util.Objects;

@Service
public class CourseProcessor implements IMessageProcessor<CourseMessage>, Serializable {
    private static final Logger logger = LoggerFactory.getLogger(CourseProcessor.class);
    private static  Gson gson = new Gson();
    @Override
    public DataStream<CourseMessage> processMessage(DataStream<String> kafkaStream, StreamExecutionEnvironment env) {
        return kafkaStream
                .map(message -> {
                    logger.info("[COURSE] - Processing message: {}", message);
                    try {
                        CourseMessage courseMessage = gson.fromJson(message, CourseMessage.class);
                        // logger.info("Deserialized message into CourseMessage: {}", courseMessage);
                        // logger.info("total subjects: "+ String.valueOf(courseMessage.getCourse().getSubjects().size()));
                        return courseMessage;
                    } catch (Exception e) {
                        logger.error("Failed to process message: {}", message, e);
                        return null;
                    }
                })
                .filter(Objects::nonNull); // Remove null entries if deserialization fails
    }

    @Override
    public boolean verifyExistance(CourseMessage message) {
        // Implement your verification logic here (e.g., check if the course already exists in DB)
        return false;
    }

    @Override
    public void save(CourseMessage entity) {
        // Implement your saving logic (e.g., save the course to a repository)
        logger.info("New course saved successfully for: {}", entity.getCourse().getCourseName());
    }
}
