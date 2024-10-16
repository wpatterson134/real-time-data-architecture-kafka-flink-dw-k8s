package pt.jorgeduarte.flink_consumer.dtos.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import pt.jorgeduarte.flink_consumer.dtos.UserDTO;
import pt.jorgeduarte.flink_consumer.persistent.entities.Address;
import pt.jorgeduarte.flink_consumer.persistent.entities.User;
import org.mapstruct.Mapping;

@Mapper
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(source = "address.street", target = "address.street")
    @Mapping(source = "address.city", target = "address.city")
    @Mapping(source = "address.state", target = "address.state")
    @Mapping(source = "address.zip", target = "address.zip")
    User toUser(UserDTO userDTO);

    Address toAddress(UserDTO.AddressDTO addressDTO);
}


