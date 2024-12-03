package pt.jorgeduarte.flink_consumer.persistent.entities.dimension;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "D_ENROLLMENT_FINANCIAL_STATUS")
public class EnrollmentFinancialStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FINANCIAL_STATUS_ID")
    private Integer id;

    @Column(name = "TUITION_FEES_DUE")
    private BigDecimal tuitionFeesDue;

    @Column(name = "FINANCIAL_STATUS")
    private String financialStatus;

    @Column(name = "FINANCIAL_SUPPORT_AMOUNT")
    private BigDecimal financialSupportAmount;

    // Getters and setters
}
