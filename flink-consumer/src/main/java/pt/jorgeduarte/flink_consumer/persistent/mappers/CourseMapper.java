package pt.jorgeduarte.flink_consumer.persistent.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;
import pt.jorgeduarte.flink_consumer.messages.Course;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.D_Course;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.D_FieldOfStudy;

@Mapper(componentModel = "spring")
public interface CourseMapper {
    CourseMapper INSTANCE = Mappers.getMapper(CourseMapper.class);

    @Mapping(source = "fieldOfStudy", target = "fieldOfStudy.fieldName")  // Mapeia a String para D_FieldOfStudy
    @Mapping(source = "courseDurationYears", target = "durationYears")
    D_Course toCourseEntity(Course courseDTO);

    @Mapping(source = "fieldOfStudy.fieldName", target = "fieldOfStudy")  // Mapeia D_FieldOfStudy para String
    Course toCourseDTO(D_Course course);

    // Mapeamento de String para D_FieldOfStudy
    default D_FieldOfStudy map(String fieldOfStudyName) {
        if (fieldOfStudyName == null) {
            return null;
        }
        D_FieldOfStudy fieldOfStudy = new D_FieldOfStudy();
        fieldOfStudy.setFieldName(fieldOfStudyName);
        return fieldOfStudy;
    }

    // Mapeamento de D_FieldOfStudy para String (para o mapeamento inverso)
    default String map(D_FieldOfStudy fieldOfStudy) {
        if (fieldOfStudy == null) {
            return null;
        }
        return fieldOfStudy.getFieldName();
    }
}