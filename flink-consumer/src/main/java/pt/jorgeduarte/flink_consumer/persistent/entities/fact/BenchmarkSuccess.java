package pt.jorgeduarte.flink_consumer.persistent.entities.fact;

import jakarta.persistence.*;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.D_Course;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.D_Student;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.D_Time;

@Entity
@Table(name = "F_BENCHMARK_SUCCESS")
public class BenchmarkSuccess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BENCHMARK_SUCCESS_ID")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "STUDENT_ID")
    private D_Student student;

    @ManyToOne
    @JoinColumn(name = "COURSE_ID")
    private D_Course course;

    @Column(name = "ACADEMIC_YEAR_OF_COMPLETION_ID")
    private Integer academicYearOfCompletionId;

    @ManyToOne
    @JoinColumn(name = "VERIFICATION_TIME_ID")
    private D_Time verificationTime;

    @Column(name = "WORKING_ON_FIELD_SINCE_ID")
    private Integer workingOnFieldSinceId;

    @Column(name = "IS_WORKING_ON_THE_FIELD")
    private Boolean isWorkingOnTheField;

    // Getters and setters
}
