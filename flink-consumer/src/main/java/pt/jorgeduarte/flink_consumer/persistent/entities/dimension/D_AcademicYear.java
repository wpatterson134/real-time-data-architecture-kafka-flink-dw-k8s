package pt.jorgeduarte.flink_consumer.persistent.entities.dimension;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "D_ACADEMIC_YEAR")
public class D_AcademicYear {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ACADEMIC_YEAR_ID")
    private Integer id;

    @Column(name = "ACADEMIC_YEAR")
    private String academicYear;

    @Column(name = "START_DATE")
    private LocalDate startDate;

    @Column(name = "END_DATE")
    private LocalDate endDate;

    // Getters and setters
}
