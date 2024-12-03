package pt.jorgeduarte.flink_consumer.persistent.entities.dimension;

import jakarta.persistence.*;

@Entity
@Table(name = "D_FIELDS_OF_STUDY")
public class FieldOfStudy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FIELD_ID")
    private Integer id;

    @Column(name = "FIELD_NAME")
    private String fieldName;

    // Getters and setters
}
