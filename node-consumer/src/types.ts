export interface Subject {
    subject_name: string;
    subject_code: string;
    subject_description: string;
    subject_type: string;
    subject_credits: number;
    first_semester: number;
    second_semester: number;
    year: number;
}

export interface Course {
    course_id: number;
    course_name: string;
    course_code: string;
    course_description: string;
    course_credits: number;
    field_of_study: string;
    course_type: string;
    course_duration_years: number;
    subjects: Subject[];
}

export interface CourseMessage {
    course: Course;
}
