package pt.jorgeduarte.flink_consumer.persistent.entities.dimension;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "D_STUDENT_DEMOGRAPHIC_DATA")
public class StudentDemographicData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "STUDENT_DEMOGRAPHIC_ID")
    private Integer id;

    @Column(name = "DATE_OF_BIRTH")
    private LocalDate dateOfBirth;

    private String nationality;
    private String maritalStatus;
    private String gender;
    private String ethnicity;

    @Column(name = "CITY_OF_BIRTH")
    private String cityOfBirth;

    @Column(name = "COUNTRY_OF_BIRTH")
    private String countryOfBirth;

    @Column(name = "CURRENT_RESIDENCE_TYPE")
    private String currentResidenceType;

    // Getters and setters
}
