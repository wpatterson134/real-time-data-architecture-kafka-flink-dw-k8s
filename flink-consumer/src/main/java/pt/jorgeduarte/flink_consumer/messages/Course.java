package pt.jorgeduarte.flink_consumer.messages;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.io.Serializable;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Course implements Serializable {
    @JsonProperty("course_id")
    private long courseId;
    @JsonProperty("course_name")
    private String courseName;
    @JsonProperty("course_code")
    private String courseCode;
    @JsonProperty("course_description")
    private String courseDescription;
    @JsonProperty("course_credits")
    private int courseCredits;
    @JsonProperty("field_of_study")
    private String fieldOfStudy;
    @JsonProperty("course_type")
    private String courseType;
    @JsonProperty("course_duration_years")
    private int courseDurationYears;
    @JsonProperty("subjects")
    private List<Subject> subjects;
}
