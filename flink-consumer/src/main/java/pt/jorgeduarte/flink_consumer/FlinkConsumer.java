package pt.jorgeduarte.flink_consumer;

import com.esotericsoftware.kryo.serializers.JavaSerializer;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.api.java.typeutils.runtime.kryo.KryoSerializer;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer;
import org.apache.flink.streaming.util.serialization.JSONKeyValueDeserializationSchema;
import org.apache.kafka.common.serialization.ListDeserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.Course;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.Subject;
import pt.jorgeduarte.flink_consumer.processors.IMessageProcessor;
import pt.jorgeduarte.flink_consumer.processors.MessageProcessorFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

public class FlinkConsumer {
    private static final Logger logger = LoggerFactory.getLogger(FlinkConsumer.class);

    public static void main(String[] args) throws Exception {
        logger.info("Starting Flink consumer with Kafka configurations");

        String kafkaBootstrapServers = System.getenv("KAFKA_BOOTSTRAP_SERVERS");
        String kafkaGroupId = System.getenv("KAFKA_GROUP_ID");
        String kafkaTopic = System.getenv("KAFKA_TOPIC");

        if (kafkaBootstrapServers == null || kafkaGroupId == null || kafkaTopic == null) {
            throw new IllegalArgumentException("KAFKA_BOOTSTRAP_SERVERS, KAFKA_GROUP_ID, or KAFKA_TOPIC is not set");
        }

        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        logger.info("Flink execution environment initialized");

        Properties properties = new Properties();
        properties.setProperty("bootstrap.servers", kafkaBootstrapServers);
        properties.setProperty("group.id", kafkaGroupId);
        logger.info("Configured Kafka consumer with bootstrap servers: {} and group id: {}", kafkaBootstrapServers, kafkaGroupId);

        FlinkKafkaConsumer<String> consumer = new FlinkKafkaConsumer<>(
                kafkaTopic,
                new SimpleStringSchema(),
                properties
        );
        consumer.setStartFromEarliest();
        DataStream<String> stream = env.addSource(consumer);
        logger.info("Started consuming messages from Kafka topic: {}", kafkaTopic);
        stream.print();
        IMessageProcessor<?> processor = MessageProcessorFactory.getProcessor(kafkaTopic);

        processor.processMessage(stream, env);

        env.execute("Flink Kafka Consumer");
    }
}
