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

// Academic Year Interface
export interface AcademicYear {
    year: number;
    start_date: string; // ISO date string
    end_date: string; // ISO date string
  }
  
  // Contact Information Interface
  export interface ContactInfo {
    number: string;
    type: string; // e.g., "Work", "Personal"
  }
  
  // Address Interface
  export interface Address {
    street: string;
    city: string;
    zip_code: string;
  }
  
  // Identification Interface
  export interface Identification {
    nacionality: string;
    city_of_birth: string;
    identification_number: string;
    identification_type: string; // e.g., "CC", "Passport"
    identification_expiration_date: string; // ISO date string
    identification_issue_date: string; // ISO date string
    identification_issue_location: string;
    nif: string; // Tax Identification Number
    nusns: string; // Social Security Number
    gender: string; // e.g., "Male", "Female"
  }

  // Student Interface
  export interface Student {
    student_id: number;
    full_name: string;
    date_of_birth: string; // ISO date string
    official_email: string;
    official_contact: ContactInfo;
    official_address: Address;
    identification: Identification;
  }

  // Socioeconomics Interface
  export interface Socioeconomics {
    socioeconomic_status: string; // e.g., "Low", "Medium", "High"
    family_income: number;
    family_size: number;
    family_dependents: number;
    responsible_parent_education: string; // e.g., "High School", "Bachelor"
    responsible_parent_employment: string; // e.g., "Employed", "Unemployed"
    responsible_parent_ocupation: string;
    has_internet_access: string; // "Yes"/"No"
    has_computer_access: string; // "Yes"/"No"
    has_smartphone_access: string; // "Yes"/"No"
    working_status: {
      is_working: boolean;
      job_title: string;
      job_company: string;
      job_income: number;
    };
  }

  // Demographics Interface
  export interface Demographics {
    marital_status: string; // e.g., "Single", "Married"
    transportation: string; // e.g., "Car", "Bus"
    health_insurance: string; // "Yes"/"No"
    health_condition: string; // e.g., "Good", "Fair"
    health_condition_details: string;
    disability: string; // "Yes"/"No"
    ethnicity: string; // e.g., "Asian", "Caucasian"
    religion: string; // e.g., "Christian", "Muslim"
    current_residence_type: string; // e.g., "Urban", "Dormitory"
  }

  // Financial Status Interface
  export interface FinancialStatus {
    total_fees: number;
    paid: number;
    pending: number;
    payment_due_date: string; // ISO date string
    payment_status: string; // e.g., "Paid", "Pending"
  }

  // Tuition Interface
  export interface Tuition {
    entity: number;
    reference: string;
    value: number;
    name: string;
    generation_date: string; // ISO date string
    expiration_date: string; // ISO date string
    status: string; // e.g., "Paid", "Expired"
  }

  // Enrollment Interface
  export interface Enrollment {
    enrollment_mode: string; // e.g., "Full-time", "Part-time"
    enrollment_date: string; // ISO date string
    course_id: number;
    enrollment_status: string; // e.g., "Active", "Completed"
    financial_status: FinancialStatus;
    tuitions: Tuition[];
  }

  // Financial Aid Interface
  export interface FinancialAid {
    financial_aid_type: string; // e.g., "Scholarship", "None"
    financial_aid_value: number;
    financial_aid_status: string; // e.g., "Approved", "Pending"
}

// Main Data Structure Interface
  export interface EnrollmentMessage {
    academic_year: AcademicYear;
    student: Student;
    socioeconomics: Socioeconomics;
    demographics: Demographics;
    enrollment: Enrollment;
    financial_aid: FinancialAid;
}

export type PerformanceMessage = {
  enrollment_id: number;
  subject_id: number;
  grade: number;
  final_grade: number;
  status: string;
};

export interface BenchmarkMessage {
  student_id: number;
  is_working_on_field: boolean;
  academic_year: AcademicYear;
  started_working_on_field: string; // ISO date format
  verification_call: string;        // ISO date format
}