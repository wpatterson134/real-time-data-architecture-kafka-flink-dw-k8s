package pt.jorgeduarte.flink_consumer.persistent.entities.dimension;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "D_ENROLLMENTS")
public class D_Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENROLLMENT_ID")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "STUDENT_ID")
    private D_Student student;

    @ManyToOne
    @JoinColumn(name = "COURSE_ID")
    private D_Course course;

    @ManyToOne
    @JoinColumn(name = "ACADEMIC_YEAR_ID")
    private D_AcademicYear academicYear;

    @ManyToOne
    @JoinColumn(name = "FINANCIAL_STATUS_ID")
    private D_EnrollmentFinancialStatus financialStatus;

    @Column(name = "ENROLLMENT_DATE")
    private LocalDate enrollmentDate;

    private String enrollmentMode;
    private String enrollmentStatus;
    private BigDecimal tuitionFees;

    // Getters and setters
}
