package pt.jorgeduarte.flink_consumer.persistent.entities.dimension;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "D_ENROLLMENTS")
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENROLLMENT_ID")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "STUDENT_ID")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "COURSE_ID")
    private Course course;

    @ManyToOne
    @JoinColumn(name = "ACADEMIC_YEAR_ID")
    private AcademicYear academicYear;

    @ManyToOne
    @JoinColumn(name = "FINANCIAL_STATUS_ID")
    private EnrollmentFinancialStatus financialStatus;

    @Column(name = "ENROLLMENT_DATE")
    private LocalDate enrollmentDate;

    private String enrollmentMode;
    private String enrollmentStatus;
    private BigDecimal tuitionFees;

    // Getters and setters
}
