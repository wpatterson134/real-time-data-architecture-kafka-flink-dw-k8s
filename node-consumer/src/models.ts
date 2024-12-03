import { Sequelize, DataTypes, Model } from 'sequelize';

// Oracle database configuration
const sequelize = new Sequelize({
  dialect: 'oracle',
  host: 'localhost',         // Oracle DB host
  port: 1521,                // Default Oracle DB port
  username: 'jorgermduarte',
  password: '123456',
  database: 'jorgermduarte',
  logging: false,            // Disable logging (optional)
});

export { sequelize };

// D_STUDENT_DEMOGRAPHIC_DATA Model
export class D_STUDENT_DEMOGRAPHIC_DATA extends Model {
  public STUDENT_DEMOGRAPHIC_ID!: number;
  public DATE_OF_BIRTH!: Date;
  public NATIONALITY!: string;
  public MARITAL_STATUS!: string;
  public GENDER!: string;
  public ETHNICITY!: string;
  public CITY_OF_BIRTH!: string;
  public COUNTRY_OF_BIRTH!: string;
  public CURRENT_RESIDENCE_TYPE!: string;
}

D_STUDENT_DEMOGRAPHIC_DATA.init({
  STUDENT_DEMOGRAPHIC_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  DATE_OF_BIRTH: DataTypes.DATE,
  NATIONALITY: DataTypes.STRING(50),
  MARITAL_STATUS: DataTypes.STRING(50),
  GENDER: DataTypes.STRING(20),
  ETHNICITY: DataTypes.STRING(50),
  CITY_OF_BIRTH: DataTypes.STRING(100),
  COUNTRY_OF_BIRTH: DataTypes.STRING(100),
  CURRENT_RESIDENCE_TYPE: DataTypes.STRING(50),
}, {
  sequelize,  // Sequelize instance is expected to be defined elsewhere
  tableName: 'D_STUDENT_DEMOGRAPHIC_DATA',
  timestamps: false,
});

// D_SOCIOECONOMIC_DATA Model
export class D_SOCIOECONOMIC_DATA extends Model {
  public SOCIOECONOMIC_ID!: number;
  public SCHOLARSHIP_STATUS!: string;
  public FAMILY_INCOME!: number;
  public INCOME!: number;
  public RESPONSABLE_PARENT_EDUCATION_LEVEL!: string;
  public RESPONSABLE_PARENT_OCCUPATION!: string;
  public HAS_INTERNET_ACCESS!: boolean;
  public HAS_COMPUTER_ACCESS!: boolean;
  public WORKING_STATUS!: string;
}

D_SOCIOECONOMIC_DATA.init({
  SOCIOECONOMIC_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  SCHOLARSHIP_STATUS: DataTypes.STRING(50),
  FAMILY_INCOME: DataTypes.DECIMAL(10, 2),
  INCOME: DataTypes.DECIMAL(10, 2),
  RESPONSABLE_PARENT_EDUCATION_LEVEL: DataTypes.STRING(100),
  RESPONSABLE_PARENT_OCCUPATION: DataTypes.STRING(100),
  HAS_INTERNET_ACCESS: DataTypes.BOOLEAN,
  HAS_COMPUTER_ACCESS: DataTypes.BOOLEAN,
  WORKING_STATUS: DataTypes.STRING(50),
}, {
  sequelize,  // Sequelize instance is expected to be defined elsewhere
  tableName: 'D_SOCIOECONOMIC_DATA',
  timestamps: false,
});

// D_STUDENTS Model
export class D_STUDENTS extends Model {
  public STUDENT_ID!: number;
  public SOCIOECONOMIC_ID!: number;
  public DEMOGRAPHIC_ID!: number;
  public NAME!: string;
}

D_STUDENTS.init({
  STUDENT_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  SOCIOECONOMIC_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: D_SOCIOECONOMIC_DATA,
      key: 'SOCIOECONOMIC_ID',
    },
  },
  DEMOGRAPHIC_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: D_STUDENT_DEMOGRAPHIC_DATA,
      key: 'STUDENT_DEMOGRAPHIC_ID',
    },
  },
  NAME: DataTypes.STRING(100),
}, {
  sequelize,  // Sequelize instance is expected to be defined elsewhere
  tableName: 'D_STUDENTS',
  timestamps: false,
});

// D_COURSES Model
export class D_COURSES extends Model {
  public COURSE_ID!: number;
  public COURSE_NAME!: string;
  public FIELD_OF_STUDY_ID!: number;
  public COURSE_TYPE!: string;
  public DURATION_YEARS!: number;
}

D_COURSES.init({
  COURSE_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  COURSE_NAME: DataTypes.STRING(100),
  FIELD_OF_STUDY_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: 'D_FIELDS_OF_STUDY',
      key: 'FIELD_ID',
    },
  },
  COURSE_TYPE: DataTypes.STRING(50),
  DURATION_YEARS: DataTypes.INTEGER,
}, {
  sequelize,  // Sequelize instance is expected to be defined elsewhere
  tableName: 'D_COURSES',
  timestamps: false,
});

// D_FIELDS_OF_STUDY Model
export class D_FIELDS_OF_STUDY extends Model {
  public FIELD_ID!: number;
  public FIELD_NAME!: string;
}

D_FIELDS_OF_STUDY.init({
  FIELD_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  FIELD_NAME: DataTypes.STRING(50),
}, {
  sequelize,  // Sequelize instance is expected to be defined elsewhere
  tableName: 'D_FIELDS_OF_STUDY',
  timestamps: false,
});

// D_SUBJECTS Model
export class D_SUBJECTS extends Model {
  public SUBJECT_ID!: number;
  public SUBJECT_NAME!: string;
  public COURSE_ID!: number;
  public ECTS!: number;
  public SUBJECT_TYPE!: string;
  public SEMESTER!: number;
  public YEAR!: number;
}

D_SUBJECTS.init({
  SUBJECT_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  SUBJECT_NAME: DataTypes.STRING(100),
  COURSE_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: D_COURSES,
      key: 'COURSE_ID',
    },
  },
  ECTS: DataTypes.INTEGER,
  SUBJECT_TYPE: DataTypes.STRING(50),
  SEMESTER: DataTypes.NUMBER,
  YEAR: DataTypes.NUMBER,
}, {
  sequelize,  // Sequelize instance is expected to be defined elsewhere
  tableName: 'D_SUBJECTS',
  timestamps: false,
});

// D_TIME Model
export class D_TIME extends Model {
  public TIME_ID!: number;
  public DAY!: number;
  public MONTH!: number;
  public YEAR!: number;
  public SEMESTER!: number;
  public WEEKDAY!: string;
  public DATE!: Date;
}

D_TIME.init({
  TIME_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  DAY: DataTypes.INTEGER,
  MONTH: DataTypes.INTEGER,
  YEAR: DataTypes.INTEGER,
  SEMESTER: DataTypes.INTEGER,
  WEEKDAY: DataTypes.STRING(20),
  DATE: DataTypes.DATE,
}, {
  sequelize,  // Sequelize instance is expected to be defined elsewhere
  tableName: 'D_TIME',
  timestamps: false,
});

// D_ACADEMIC_YEAR Model
export class D_ACADEMIC_YEAR extends Model {
  public ACADEMIC_YEAR_ID!: number;
  public ACADEMIC_YEAR!: string;
  public START_DATE!: Date;
  public END_DATE!: Date;
}

D_ACADEMIC_YEAR.init({
  ACADEMIC_YEAR_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ACADEMIC_YEAR: DataTypes.STRING(20),
  START_DATE: DataTypes.DATE,
  END_DATE: DataTypes.DATE,
}, {
  sequelize,  // Sequelize instance is expected to be defined elsewhere
  tableName: 'D_ACADEMIC_YEAR',
  timestamps: false,
});

// F_ACADEMIC_PERFORMANCE Model
export class F_ACADEMIC_PERFORMANCE extends Model {
  public ENROLLMENT_SUBJECT_ID!: number;
  public ENROLLMENT_ID!: number;
  public SUBJECT_ID!: number;
  public TIME_ID!: number;
  public FINAL_GRADE!: number;
  public STATUS!: number;
}

F_ACADEMIC_PERFORMANCE.init({
  ENROLLMENT_SUBJECT_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ENROLLMENT_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: 'D_ENROLLMENTS',
      key: 'ENROLLMENT_ID',
    },
  },
  SUBJECT_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: D_SUBJECTS,
      key: 'SUBJECT_ID',
    },
  },
  TIME_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: D_TIME,
      key: 'TIME_ID',
    },
  },
  FINAL_GRADE: DataTypes.DECIMAL(5, 2),
  STATUS: DataTypes.INTEGER,
}, {
  sequelize,  // Sequelize instance is expected to be defined elsewhere
  tableName: 'F_ACADEMIC_PERFORMANCE',
  timestamps: false,
});

// D_ENROLLMENT_FINANCIAL_STATUS Model
export class D_ENROLLMENT_FINANCIAL_STATUS extends Model {
  public FINANCIAL_STATUS_ID!: number;
  public TUITION_FEES_DUE!: number;
  public FINANCIAL_STATUS!: string;
  public FINANCIAL_SUPPORT_AMOUNT!: number;
}

D_ENROLLMENT_FINANCIAL_STATUS.init({
  FINANCIAL_STATUS_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  TUITION_FEES_DUE: {
    type: DataTypes.DECIMAL(10, 2),
  },
  FINANCIAL_STATUS: {
    type: DataTypes.STRING(20),
  },
  FINANCIAL_SUPPORT_AMOUNT: {
    type: DataTypes.DECIMAL(10, 2),
  },
}, {
  sequelize,  // Sequelize instance is expected to be defined elsewhere
  tableName: 'D_ENROLLMENT_FINANCIAL_STATUS',
  timestamps: false,
});


// D_ENROLLMENTS Model
export class D_ENROLLMENTS extends Model {
  public ENROLLMENT_ID!: number;
  public STUDENT_ID!: number;
  public COURSE_ID!: number;
  public ACADEMIC_YEAR_ID!: number;
  public FINANCIAL_STATUS_ID!: number;
  public ENROLLMENT_MODE!: string;
  public ENROLLMENT_DATE!: Date;
  public ENROLLMENT_STATUS!: string;
  public TUITION_FEES!: number;
}
D_ENROLLMENTS.init({
  ENROLLMENT_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  STUDENT_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: D_STUDENTS,
      key: 'STUDENT_ID',
    },
  },
  COURSE_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: D_COURSES,
      key: 'COURSE_ID',
    },
  },
  ACADEMIC_YEAR_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: D_ACADEMIC_YEAR,
      key: 'ACADEMIC_YEAR_ID',
    },
  },
  FINANCIAL_STATUS_ID: {
    type: DataTypes.INTEGER,
    references: {
      model: D_ENROLLMENT_FINANCIAL_STATUS,
      key: 'FINANCIAL_STATUS_ID',
    },
  },
  ENROLLMENT_MODE: DataTypes.STRING(50),
  ENROLLMENT_DATE: DataTypes.DATE,
  ENROLLMENT_STATUS: DataTypes.STRING(50),
  TUITION_FEES: DataTypes.DECIMAL(10, 2),
}, {
  sequelize,  // Sequelize instance is expected to be defined elsewhere
  tableName: 'D_ENROLLMENTS',
  timestamps: false,
});