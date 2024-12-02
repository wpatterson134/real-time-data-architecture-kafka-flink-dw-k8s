package pt.jorgeduarte.flink_consumer.processors;

import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;

import java.sql.SQLException;

public interface IMessageProcessor<T> {
     DataStream<T> processMessage(DataStream<String> kafkaStream, StreamExecutionEnvironment env);
     boolean verifyExistance(T message) throws SQLException;
     void save(T entity) throws SQLException;
}
