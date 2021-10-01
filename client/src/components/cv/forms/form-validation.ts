import { Rule } from 'rc-field-form/lib/interface';
import { phonePattern } from 'services/validators';

const validationMessages = {
  required: "Field can't be empty",
  min: (length: number): string => `Minimal text length is ${length} symbols`,
  max: (length: number): string => `Maximal text length is ${length} symbols`,
  whitespace: "Field can't contain only whitespaces",
  invalid: (fieldName: string): string => `This is not a valid ${fieldName}`,
};

const contactsValidationRules: {
  [key: string]: Rule[];
} = {
  phone: [
    {
      max: 25,
      message: validationMessages.max(25),
    },
    () => ({
      async validator(_, value) {
        if (!value || phonePattern.test(value)) {
          return Promise.resolve();
        }
        throw new Error(validationMessages.invalid('phone number'));
      },
    }),
    {
      whitespace: true,
      message: validationMessages.whitespace,
    },
  ],
  email: [
    {
      type: 'email',
      message: validationMessages.invalid('email'),
    },
    {
      max: 50,
      message: validationMessages.max(50),
    },
    {
      whitespace: true,
      message: validationMessages.whitespace,
    },
  ],
  skype: [
    {
      max: 30,
      message: validationMessages.max(30),
    },
    {
      whitespace: true,
      message: validationMessages.whitespace,
    },
  ],
  telegram: [
    {
      max: 30,
      message: validationMessages.max(30),
    },
    {
      whitespace: true,
      message: validationMessages.whitespace,
    },
  ],
  linkedin: [
    {
      max: 30,
      message: validationMessages.max(30),
    },
    {
      whitespace: true,
      message: validationMessages.whitespace,
    },
  ],
  locations: [
    {
      required: true,
      message: validationMessages.required,
    },
    {
      max: 300,
      message: validationMessages.max(300),
    },
    {
      whitespace: true,
      message: validationMessages.whitespace,
    },
  ],
  github: [
    {
      max: 30,
      message: validationMessages.max(30),
    },
    {
      whitespace: true,
      message: validationMessages.whitespace,
    },
  ],
  website: [
    {
      type: 'url',
      message: validationMessages.invalid('URL'),
    },
    {
      max: 100,
      message: validationMessages.max(100),
    },
    {
      whitespace: true,
      message: validationMessages.whitespace,
    },
  ],
};

const userDataValidationRules: {
  [key: string]: Rule[];
} = {
  name: [
    {
      required: true,
      message: validationMessages.required,
    },
    {
      max: 100,
      message: validationMessages.max(100),
    },
    {
      whitespace: true,
      message: validationMessages.whitespace,
    },
  ],
  desiredPosition: [
    {
      required: true,
      message: validationMessages.required,
    },
    {
      max: 300,
      message: validationMessages.max(300),
    },
    {
      whitespace: true,
      message: validationMessages.whitespace,
    },
  ],
  selfIntroLink: [
    {
      type: 'url',
      message: validationMessages.invalid('URL'),
    },
    {
      max: 300,
      message: validationMessages.max(300),
    },
    {
      whitespace: true,
      message: validationMessages.whitespace,
    },
  ],
  avatarLink: [
    {
      type: 'url',
      message: validationMessages.invalid('URL'),
    },
    {
      max: 300,
      message: validationMessages.max(300),
    },
    {
      whitespace: true,
      message: validationMessages.whitespace,
    },
  ],
  englishLevel: [
    {
      required: true,
      message: validationMessages.required,
    },
  ],
  militaryService: [
    {
      required: true,
      message: validationMessages.required,
    },
  ],
  startFrom: [
    {
      required: true,
      message: validationMessages.required,
    },
  ],
  notes: [
    {
      required: true,
      message: validationMessages.required,
    },
    {
      max: 1500,
      message: validationMessages.max(1500),
    },
    {
      min: 50,
      message: validationMessages.min(50),
    },
    {
      whitespace: true,
      message: validationMessages.whitespace,
    },
  ],
};

export { contactsValidationRules, userDataValidationRules };
