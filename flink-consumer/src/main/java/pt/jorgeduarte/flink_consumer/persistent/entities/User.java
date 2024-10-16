package pt.jorgeduarte.flink_consumer.persistent.entities;

import lombok.Data;

@Data
public class User {
    private long id; // If the database auto-generates the ID, you can omit this field
    private String name;
    private String email;
    private String phone;
    private String street;
    private String city;
    private String state;
    private String zip;
}
