package pt.jorgeduarte.flink_consumer.persistent.entities.dimension;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "D_SOCIOECONOMIC_DATA")
public class SocioeconomicData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SOCIOECONOMIC_ID")
    private Integer id;

    private String scholarshipStatus;
    private BigDecimal familyIncome;
    private BigDecimal income;

    @Column(name = "RESPONSIBLE_PARENT_EDUCATION_LEVEL")
    private String parentEducationLevel;

    @Column(name = "RESPONSIBLE_PARENT_OCCUPATION")
    private String parentOccupation;

    private Boolean hasInternetAccess;
    private Boolean hasComputerAccess;
    private String workingStatus;

    // Getters and setters
}

