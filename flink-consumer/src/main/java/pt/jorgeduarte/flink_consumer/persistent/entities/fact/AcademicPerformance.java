package pt.jorgeduarte.flink_consumer.persistent.entities.fact;

import jakarta.persistence.*;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.D_Enrollment;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.D_Subject;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.D_Time;

import java.math.BigDecimal;

@Entity
@Table(name = "F_ACADEMIC_PERFORMANCE")
public class AcademicPerformance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENROLLMENT_SUBJECT_ID")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "ENROLLMENT_ID")
    private D_Enrollment enrollment;

    @ManyToOne
    @JoinColumn(name = "SUBJECT_ID")
    private D_Subject subject;

    @ManyToOne
    @JoinColumn(name = "TIME_ID")
    private D_Time time;

    @Column(name = "FINAL_GRADE", precision = 5, scale = 2)
    private BigDecimal finalGrade;

    private Integer status;

    // Getters and setters
}
