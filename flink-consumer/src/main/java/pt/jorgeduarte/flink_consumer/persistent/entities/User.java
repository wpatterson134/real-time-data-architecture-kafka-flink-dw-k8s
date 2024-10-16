package pt.jorgeduarte.flink_consumer.persistent.entities;

import lombok.Data;

import lombok.Data;

@Data
public class User {
    private long id;
    private String name;
    private String email;
    private String phone;

    private Address address;
}

