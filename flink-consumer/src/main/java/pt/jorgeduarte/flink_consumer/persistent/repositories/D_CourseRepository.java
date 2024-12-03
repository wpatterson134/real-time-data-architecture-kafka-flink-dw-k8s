package pt.jorgeduarte.flink_consumer.persistent.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pt.jorgeduarte.flink_consumer.persistent.entities.dimension.D_Course;

@Repository
public interface D_CourseRepository extends JpaRepository<D_Course, Integer> {
    // Custom query methods can be added here if necessary
    D_Course findByCourseName(String courseName);
}