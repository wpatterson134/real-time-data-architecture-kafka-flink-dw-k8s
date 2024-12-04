import { D_COURSES, D_FIELDS_OF_STUDY, D_SUBJECTS } from "../models";
import { CourseMessage } from "../types";

/**
 * Ensures the field of study exists in the database.
 */
const ensureFieldOfStudy = async (fieldOfStudyName: string) => {
  const [fieldOfStudy, created] = await D_FIELDS_OF_STUDY.findOrCreate({
    where: { FIELD_NAME: fieldOfStudyName },
    defaults: { FIELD_NAME: fieldOfStudyName },
  });

  if (created) {
    console.log(`Field of study "${fieldOfStudyName}" saved to the Oracle database`);
  }

  return fieldOfStudy;
};

/**
 * Checks if the course already exists in the database.
 */
const courseExists = async (courseName: string) => {
  const existingCourse = await D_COURSES.findOne({
    where: { COURSE_NAME: courseName },
  });
  return !!existingCourse;
};

/**
 * Creates a new course in the database.
 */
const createCourse = async (course: CourseMessage['course'], fieldOfStudyId: number) => {
  const newCourse = await D_COURSES.create({
    COURSE_NAME: course.course_name,
    FIELD_OF_STUDY_ID: fieldOfStudyId,
    COURSE_TYPE: course.course_type,
    DURATION_YEARS: course.course_duration_years,
  });

  console.log(`[COURSE] Course "${course.course_name}" saved to the Oracle database`);
  return newCourse;
};

/**
 * Adds subjects to a course.
 */
const addCourseSubjects = async (courseId: number, subjects: CourseMessage['course']['subjects']) => {
  for (const subject of subjects) {
    await D_SUBJECTS.create({
      COURSE_ID: courseId,
      SUBJECT_NAME: subject.subject_name,
      ECTS: subject.subject_credits,
      SUBJECT_TYPE: 'Mandatory',
      SEMESTER: subject.first_semester === 1 ? 1 : 2,
      YEAR: subject.year,
    });
  }

  console.log(` > [COURSE] Course subjects saved to the Oracle database`);
};

/**
 * Processes a course message and saves its data to the database.
 */
const process = async (courseMessage: CourseMessage) => {
  const { course } = courseMessage;

  // Validate field of study
  if (!course.field_of_study) {
    //console.error(`[COURSE] Field of study is missing for course "${course.course_name} (COURSE NOT CREATED)"`);
    return;
  }

  // Ensure field of study exists
  const fieldOfStudy = await ensureFieldOfStudy(course.field_of_study);

  // Check if the course already exists
  if (await courseExists(course.course_name)) {
    console.log(`[COURSE] Course "${course.course_name}" already exists in the Oracle database`);
    return;
  }

  // Create the new course
  const newCourse = await createCourse(course, fieldOfStudy.FIELD_ID);

  // Add subjects to the course
  await addCourseSubjects(newCourse.COURSE_ID, course.subjects);
};

export const CourseProcessor = {
  process,
};
