package pt.jorgeduarte.flink_consumer.persistent.entities.dimension;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "D_COURSES")
public class D_Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "COURSE_ID")
    private Integer id;

    @Column(name = "COURSE_NAME")
    private String courseName;

    @ManyToOne
    @JoinColumn(name = "FIELD_OF_STUDY_ID")
    private D_FieldOfStudy fieldOfStudy;

    @Column(name = "COURSE_TYPE")
    private String courseType;

    @Column(name = "DURATION_YEARS")
    private Integer durationYears;

    // Getters and setters
}
