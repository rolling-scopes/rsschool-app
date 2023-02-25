import { Rule } from 'antd/lib/form';

const RSSCHOOL_BOT_LINK = 'https://t.me/rsschool_bot?start';
const DATA_PROCESSING_TEXT =
  'I agree to the processing of my personal data contained in the application and sharing it with companies only for students employment purposes.';
const SUCCESS_TEXT = (courseName?: string) =>
  courseName
    ? `You have successfully registered for the ${courseName} course.`
    : 'Before you start we need to consider your application and submit you to a course. It could take some time. We will send you next steps via an email on the address you provided during registration.';

const ERROR_MESSAGES = {
  chooseAtLeastOne: 'Should choose at least one',
  shouldAgree: 'Should agree to the data processing',
  inEnglish: (prop: string) => `${prop} should be in English`,
  email: 'Invalid email',
  epamEmail: 'Please enter a valid EPAM email',
  location: 'Please select city',
  phone: 'Invalid phone number',
  tryLater: 'An error occurred. Please try later',
};

const TOOLTIPS = {
  locationMentor: 'We need your location for understanding audience and use it for students distribution',
  locationStudent: 'We need your location for understanding the audience and for mentor distribution.',
  primaryEmail: 'No spam e-mails. Only for course purposes.',
  epamEmail: 'If you are EPAM employee, please specify your email to avoid some manual processes later',
};

const FORM_TITLES = {
  mentorForm: 'Mentors registration',
  studentForm: 'Welcome to RS School',
};

const PLACEHOLDERS = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'user@example.com',
  epamEmail: 'first_last@epam.com',
  telegram: 'johnny',
  skype: 'johnsmith',
  whatsApp: 'johndoe',
  phone: '+1234567890',
  notes: 'Preferable time to contact, planned days off etc.',
  courses: 'Select courses',
  languages: 'Select languages',
  aboutYourself: 'A couple words about yourself...',
};

const EXTRAS = {
  inEnglish: 'In English, as in passport',
  readyToMentor: 'You are ready to mentor per course',
};

const LABELS = {
  firstName: 'First Name',
  lastName: 'Last Name',
  location: 'Location',
  primaryEmail: 'Primary E-mail',
  epamEmail: 'EPAM E-mail',
  telegram: 'Telegram',
  skype: 'Skype',
  whatsApp: 'WhatsApp',
  email: 'E-mail',
  phone: 'Phone',
  notes: 'Contact Notes',
  courses: 'Preferred Courses',
  languages: 'Languages you can mentor in',
  languagesStudent: 'Mentoring languages',
  aboutYourself: 'About Yourself',
  disciplines: 'You can mentor',
  studentsCount: 'Count of students',
  studentsLocation: 'Students location',
  course: 'Course',
};

const CARD_TITLES = {
  additionalInfo: 'Additional information',
  contactInfo: 'Contact information',
  courseDetails: 'Course details',
  disciplines: 'Disciplines',
  personalInfo: 'Personal information',
  preferences: 'Preferences about students',
};

const VALIDATION_RULES: Rule[] = [
  {
    validator: (_, value) => {
      return value?.length ? Promise.resolve() : Promise.reject(new Error(ERROR_MESSAGES.chooseAtLeastOne));
    },
  },
];

const TAIL_FORM_ITEM_LAYOUT = (isMentorshipSection: boolean) =>
  isMentorshipSection
    ? {
        wrapperCol: {
          xs: { span: 12, offset: 0 },
          sm: { span: 16, offset: 4 },
          md: { span: 10, offset: 7 },
        },
      }
    : {
        wrapperCol: {
          xs: { span: 12, offset: 0 },
          sm: { span: 16, offset: 4 },
          md: { span: 12, offset: 6 },
          xl: { span: 8, offset: 8 },
        },
      };

const WIDE_FORM_ITEM_LAYOUT = (isStudentForm = false) =>
  isStudentForm
    ? {}
    : {
        labelCol: {
          sm: { span: 16, offset: 4 },
          md: { span: 7, offset: 0 },
        },
        wrapperCol: {
          sm: { span: 16, offset: 4 },
          md: { span: 10, offset: 0 },
        },
      };

const DEFAULT_FORM_ITEM_LAYOUT = {
  labelCol: {
    sm: { offset: 4 },
    md: { span: 6, offset: 0 },
    xl: { span: 8, offset: 0 },
  },
  wrapperCol: {
    sm: { span: 16, offset: 4 },
    md: { span: 12, offset: 0 },
    xl: { span: 8, offset: 0 },
  },
};

export {
  RSSCHOOL_BOT_LINK,
  DATA_PROCESSING_TEXT,
  ERROR_MESSAGES,
  TOOLTIPS,
  FORM_TITLES,
  PLACEHOLDERS,
  EXTRAS,
  LABELS,
  CARD_TITLES,
  VALIDATION_RULES,
  DEFAULT_FORM_ITEM_LAYOUT,
  TAIL_FORM_ITEM_LAYOUT,
  WIDE_FORM_ITEM_LAYOUT,
  SUCCESS_TEXT,
};
