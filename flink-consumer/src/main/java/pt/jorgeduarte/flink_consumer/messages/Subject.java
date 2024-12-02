package pt.jorgeduarte.flink_consumer.messages;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.io.Serializable;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Subject implements Serializable {
    @JsonProperty("subject_name")
    private String subjectName;
    @JsonProperty("subject_code")
    private String subjectCode;
    @JsonProperty("subject_description")
    private String subjectDescription;
    @JsonProperty("subject_type")
    private String subjectType;
    @JsonProperty("subject_credits")
    private int subjectCredits;
    @JsonProperty("first_semester")
    private int firstSemester;
    @JsonProperty("second_semester")
    private int secondSemester;
    @JsonProperty("year")
    private int year;

}
