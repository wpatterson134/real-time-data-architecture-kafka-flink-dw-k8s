package pt.jorgeduarte.flink_consumer.persistent.entities.dimension;

import jakarta.persistence.*;

@Entity
@Table(name = "D_SUBJECTS")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SUBJECT_ID")
    private Integer id;

    @Column(name = "SUBJECT_NAME")
    private String subjectName;

    @ManyToOne
    @JoinColumn(name = "COURSE_ID")
    private Course course;

    private Integer ects;

    @Column(name = "SUBJECT_TYPE")
    private String subjectType;

    // Getters and setters
}
