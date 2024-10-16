package pt.jorgeduarte.flink_consumer.dtos.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import pt.jorgeduarte.flink_consumer.dtos.UserDTO;
import pt.jorgeduarte.flink_consumer.persistent.entities.User;

@Mapper
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);
    User toUser(UserDTO userDTO);
}

