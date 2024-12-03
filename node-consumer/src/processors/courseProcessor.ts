import { D_COURSES, D_FIELDS_OF_STUDY, D_SUBJECTS } from "../models";
import { CourseMessage } from "../types";


const process = async (courseMessage: CourseMessage) => {
    const { course } = courseMessage;

    const [fieldOfStudy, created] = await D_FIELDS_OF_STUDY.findOrCreate({
      where: { FIELD_NAME: course.field_of_study },
      defaults: { FIELD_NAME: course.field_of_study },
    });
  
    if (created) {
      console.log(`Field of study "${course.field_of_study}" saved to the Oracle database`);
    }
  
  
    const existingCourse = await D_COURSES.findOne({
      where: { COURSE_NAME: course.course_name },
    });
    if (existingCourse) {
      console.log(`Course "${course.course_name}" already exists in the Oracle database`);
      return
    }else{

        const newCourse = await D_COURSES.create({
            COURSE_NAME: course.course_name,
            FIELD_OF_STUDY_ID: fieldOfStudy.FIELD_ID,
            COURSE_TYPE: course.course_type,
            DURATION_YEARS: course.course_duration_years,
         });
        console.log(`Course "${course.course_name}" saved to the Oracle database`);

        // add the course subjects to the course
        const subjects = course.subjects;
        for (const subject of subjects) {
            await D_SUBJECTS.create({
            COURSE_ID: newCourse.COURSE_ID,
            SUBJECT_NAME: subject.subject_name,
            ECTS : subject.subject_credits,
            SUBJECT_TYPE: 'Mandatory',
            });
        }
        console.log(`Course subjects saved to the Oracle database`);
    }
  };


export const CourseProcessor = {
    process
};