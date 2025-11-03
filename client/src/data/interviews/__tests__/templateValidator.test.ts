import { InterviewTemplate, Question, QuestionCategory } from '@client/data/interviews';
import { validateInterviewTemplate, validateQuestionCategory, TemplateValidationError } from '../templateValidator';

const mockQuestion1: Question = { id: 101, name: 'Q1' };
const mockQuestion2: Question = { id: 102, name: 'Q2' };
const mockQuestionDuplicateId: Question = { id: 101, name: 'Q_DUP' };

const mockCategory1: QuestionCategory = {
  id: 1,
  name: 'Behavioral',
  questions: [mockQuestion1, mockQuestion2],
};

const mockCategory2: QuestionCategory = {
  id: 2,
  name: 'Technical',
  description: 'Deep dive questions',
  questions: [],
};

const mockCategoryDuplicateId: QuestionCategory = {
  id: 1,
  name: 'Duplicate Category',
  questions: [],
};

const mockValidTemplate: InterviewTemplate = {
  name: 'Valid Tech Interview',
  categories: [mockCategory1, mockCategory2],
  examplesUrl: 'http://example.com/examples',
  descriptionHtml: '<p>A description</p>',
};

const mockTemplateWithDuplicateCategory: InterviewTemplate = {
  name: 'Invalid Template - Dup Cat ID',
  categories: [mockCategory1, mockCategoryDuplicateId],
  examplesUrl: 'http://example.com/examples',
};

const mockCategoryWithDuplicateQuestions: QuestionCategory = {
  id: 3,
  name: 'Invalid Category - Dup Q ID',
  questions: [mockQuestion1, mockQuestionDuplicateId], // IDs are 101, 101
};

describe('TemplateValidationError', () => {
  it('should be an instance of Error', () => {
    const error = new TemplateValidationError('Test');
    expect(error).toBeInstanceOf(Error);
  });

  it('should have the correct name property', () => {
    const error = new TemplateValidationError('Test');
    expect(error.name).toBe('TemplateValidationError');
    expect(error.message).toBe('Test');
  });

  it('should have the correct message property', () => {
    const error = new TemplateValidationError('Test');
    expect(error.message).toBe('Test');
  });
});

describe('validateQuestionCategory', () => {
  it('should successfully validate a category with unique question IDs', () => {
    expect(() => validateQuestionCategory(mockCategory1)).not.toThrow();
  });

  it('should successfully validate a category with no questions', () => {
    expect(() => validateQuestionCategory(mockCategory2)).not.toThrow();
  });

  it('should throw TemplateValidationError for duplicate question IDs', () => {
    expect(() => validateQuestionCategory(mockCategoryWithDuplicateQuestions)).toThrow(TemplateValidationError);
    expect(() => validateQuestionCategory(mockCategoryWithDuplicateQuestions)).toThrow(
      'Questions must have unique ids. Category ID: 3',
    );
  });
});

describe('validateInterviewTemplate', () => {
  it('should successfully validate a valid template with unique category and question IDs', () => {
    expect(() => validateInterviewTemplate(mockValidTemplate)).not.toThrow();
  });

  it('should throw TemplateValidationError for duplicate category IDs', () => {
    expect(() => validateInterviewTemplate(mockTemplateWithDuplicateCategory)).toThrow(TemplateValidationError);
    expect(() => validateInterviewTemplate(mockTemplateWithDuplicateCategory)).toThrow(
      'Categories must have unique ids. Template name: Invalid Template - Dup Cat ID',
    );
  });

  it('should throw TemplateValidationError when a nested category has duplicate question IDs, and prepend template name', () => {
    const templateWithNestedError: InterviewTemplate = {
      name: 'Template-WithError',
      categories: [mockCategory1, mockCategoryWithDuplicateQuestions],
      examplesUrl: 'url',
    };

    expect(() => validateInterviewTemplate(templateWithNestedError)).toThrow(TemplateValidationError);
    expect(() => validateInterviewTemplate(templateWithNestedError)).toThrow(
      'Template name Template-WithError. Questions must have unique ids. Category ID: 3',
    );
  });
});
