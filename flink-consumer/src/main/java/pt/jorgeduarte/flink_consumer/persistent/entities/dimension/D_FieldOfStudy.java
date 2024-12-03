package pt.jorgeduarte.flink_consumer.persistent.entities.dimension;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "D_FIELDS_OF_STUDY")
public class D_FieldOfStudy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FIELD_ID")
    private Integer id;

    @Column(name = "FIELD_NAME")
    private String fieldName;

    // Getters and setters
}
