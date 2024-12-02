package pt.jorgeduarte.flink_consumer.persistent.entities.fact;

import jakarta.persistence.*;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.Course;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.Student;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.Time;

@Entity
@Table(name = "F_BENCHMARK_SUCCESS")
public class BenchmarkSuccess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BENCHMARK_SUCCESS_ID")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "STUDENT_ID")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "COURSE_ID")
    private Course course;

    @Column(name = "ACADEMIC_YEAR_OF_COMPLETION_ID")
    private Integer academicYearOfCompletionId;

    @ManyToOne
    @JoinColumn(name = "VERIFICATION_TIME_ID")
    private Time verificationTime;

    @Column(name = "WORKING_ON_FIELD_SINCE_ID")
    private Integer workingOnFieldSinceId;

    @Column(name = "IS_WORKING_ON_THE_FIELD")
    private Boolean isWorkingOnTheField;

    // Getters and setters
}
