package pt.jorgeduarte.flink_consumer.messages;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.io.Serializable;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CourseMessage  implements Serializable {
    @JsonProperty("course")
    private Course course;
}

