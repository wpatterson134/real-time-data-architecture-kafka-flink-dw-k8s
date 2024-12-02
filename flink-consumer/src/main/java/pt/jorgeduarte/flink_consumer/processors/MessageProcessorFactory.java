package pt.jorgeduarte.flink_consumer.processors;

public class MessageProcessorFactory {
    public static IMessageProcessor<?> getProcessor(String topic) {
        switch (topic) {
            case "course-topic":
                return new CourseProcessor();
            default:
                throw new IllegalArgumentException("No processor found for topic: " + topic);
        }
    }
}

