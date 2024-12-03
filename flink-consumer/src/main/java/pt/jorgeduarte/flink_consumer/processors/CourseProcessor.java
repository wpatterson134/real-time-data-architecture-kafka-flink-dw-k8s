package pt.jorgeduarte.flink_consumer.processors;

import com.google.gson.Gson;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import pt.jorgeduarte.flink_consumer.messages.CourseMessage;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.D_Course;
import pt.jorgeduarte.flink_consumer.persistent.mappers.CourseMapper;

import java.io.Serializable;
import java.util.Objects;

@Service
public class CourseProcessor implements IMessageProcessor<CourseMessage>, Serializable {
    private static final Logger logger = LoggerFactory.getLogger(CourseProcessor.class);
    private static  Gson gson = new Gson();
    //private transient D_CourseRepository courseRepository;

    @Override
    public DataStream<CourseMessage> processMessage(DataStream<String> kafkaStream, StreamExecutionEnvironment env) {
        return kafkaStream
                .map(message -> {
                    logger.info("[COURSE] - Processing message: {}", message);
                    try {
                        CourseMessage courseMessage = gson.fromJson(message, CourseMessage.class);
                        if(!alreadyExists(courseMessage)){
                            save(courseMessage);
                        }
                        return courseMessage;
                    } catch (Exception e) {
                        logger.error("Failed to process message: {}", message, e);
                        return null;
                    }
                })
                .filter(Objects::nonNull); // Remove null entries if deserialization fails
    }

    @Override
    public boolean alreadyExists(CourseMessage message) {
        //List<D_Course> courses = courseRepository.findAll();

        //D_Course course = courses.stream()
        //        .filter(s -> s.getCourseName().equals(message.getCourse().getCourseName()))
        //        .findFirst()
        //        .orElse(null);
        //return course != null;
        return false;
    }

    @Override
    public void save(CourseMessage message) {
        D_Course d_course = CourseMapper.INSTANCE.toCourseEntity(message.getCourse());
        logger.info("course mapped successfully");
    }
}
