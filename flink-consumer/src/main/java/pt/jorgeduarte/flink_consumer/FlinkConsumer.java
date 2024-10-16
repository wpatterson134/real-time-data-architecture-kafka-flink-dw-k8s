package pt.jorgeduarte.flink_consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer;
import pt.jorgeduarte.flink_consumer.dtos.UserDTO;
import pt.jorgeduarte.flink_consumer.dtos.mappers.UserMapper;
import pt.jorgeduarte.flink_consumer.persistent.entities.User;
import pt.jorgeduarte.flink_consumer.utils.DatabaseUtil;

import java.sql.SQLException;
import java.util.Properties;

public class FlinkConsumer {
    public static void main(String[] args) throws Exception {
        // Retrieve environment variables
        String kafkaBootstrapServers = System.getenv("KAFKA_BOOTSTRAP_SERVERS");
        String kafkaGroupId = System.getenv("KAFKA_GROUP_ID");
        String kafkaTopic = System.getenv("KAFKA_TOPIC");

        String dbUrl = System.getenv("DB_URL");
        String dbUsername = System.getenv("DB_USERNAME");
        String dbPassword = System.getenv("DB_PASSWORD");

        // Initialize database connection
        DatabaseUtil.initialize(dbUrl, dbUsername, dbPassword);

        // Set up Flink execution environment
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // Configure Kafka consumer properties
        Properties properties = new Properties();
        properties.setProperty("bootstrap.servers", kafkaBootstrapServers);
        properties.setProperty("group.id", kafkaGroupId);

        FlinkKafkaConsumer<String> consumer = new FlinkKafkaConsumer<>(
                kafkaTopic,
                new SimpleStringSchema(),
                properties
        );

        DataStream<String> stream = env.addSource(consumer);

        stream.map(value -> {
            ObjectMapper objectMapper = new ObjectMapper();
            UserDTO userDTO = objectMapper.readValue(value, UserDTO.class);
            User user = UserMapper.INSTANCE.toUser(userDTO);
            try {
                DatabaseUtil.saveUser(user);
            } catch (SQLException e) {
                e.printStackTrace();
                // Handle exception appropriately
            }
            return value;
        });

        env.execute("Flink Kafka to Oracle Data Warehouse");
    }
}
