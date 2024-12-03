package pt.jorgeduarte.flink_consumer.persistent.entities.dimension;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "D_TIME")
public class Time {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TIME_ID")
    private Integer id;

    private Integer day;
    private Integer month;
    private Integer year;
    private Integer semester;

    private String weekday;

    @Column(name = "DATE")
    private LocalDate date;

    // Getters and setters
}

