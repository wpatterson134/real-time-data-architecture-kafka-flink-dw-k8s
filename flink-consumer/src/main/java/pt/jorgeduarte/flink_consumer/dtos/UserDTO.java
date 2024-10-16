package pt.jorgeduarte.flink_consumer.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {
    private long id;
    private String name;
    private String email;
    private String phone;
    private AddressDTO address;
    @Getter
    @Setter
    public static class AddressDTO {
        private String street;
        private String city;
        private String state;
        private String zip;
    }
}

