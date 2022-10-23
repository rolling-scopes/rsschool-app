import { Rule } from 'antd/lib/form';

export const DEFAULT_COLUMN_SIZES = { xs: 24, sm: 24, md: 24, lg: 24, xl: 24 };
export const DEFAULT_DOUBLE_COLUMN_SIZES = { xs: 24, sm: 24, md: 12, lg: 12, xl: 12 };
export const DEFAULT_ROW_GUTTER = 24;

export const TEXT_EMAIL_TOOLTIP = 'No spam e-mails. Only for course purposes.';
export const TEXT_LOCATION_STUDENT_TOOLTIP =
  'We need your location for understanding the audience and for mentor distribution.';
export const RSSCHOOL_BOT_LINK = 'https://t.me/rsschool_bot?start';
export const DATA_PROCESSING_TEXT =
  'I agree to the processing of my personal data contained in the application and sharing it with companies only for students employment purposes.';
export const SUCCESS_TEXT =
  'Before you start we need to consider your application and submit you to a course. It could take some time. We will send you next steps via an email on the address you provided during registration.';

export const ERROR_MESSAGES = {
  chooseAtLeastOne: 'Should choose at least one',
  shouldAgree: 'Should agree to the data processing',
  inEnglish: (prop: string) => `${prop} should be in English`,
  email: 'Invalid email',
  epamEmail: 'Please enter a valid EPAM email',
  location: 'Please select city',
  phone: 'Invalid phone number',
  tryLater: 'An error occurred. Please try later',
};

export const TOOLTIPS = {
  locationMentor: 'We need your location for understanding audience and use it for students distribution',
  primaryEmail: 'No spam e-mails. Only for course purposes.',
  epamEmail: 'If you are EPAM employee, please specify your email to avoid some manual processes later',
};

export const PLACEHOLDERS = {
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

export const EXTRAS = {
  inEnglish: 'In English, as in passport',
  readyToMentor: 'You are ready to mentor per course',
};

export const LABELS = {
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
  aboutYourself: 'About Yourself',
  disciplines: 'You can mentor',
  studentsCount: 'Count of students',
  studentsLocation: 'Students location',
};

export const VALIDATION_RULES: Rule[] = [
  {
    validator: (_, value) => {
      return value?.length ? Promise.resolve() : Promise.reject(new Error(ERROR_MESSAGES.chooseAtLeastOne));
    },
  },
];
