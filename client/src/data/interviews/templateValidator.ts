import { InterviewTemplate, Question, QuestionCategory } from '@client/data/interviews/types';

class TemplateValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateValidationError';
  }
}

export class InterviewTemplateValidator {
  constructor({ name, categories, examplesUrl, descriptionHtml }: InterviewTemplate) {
    this.name = name;
    this.categories = categories;
    this.examplesUrl = examplesUrl;
    this.descriptionHtml = descriptionHtml;

    const uniqueCatIds = new Set<number>(this.categories.map(c => c.id));

    if (uniqueCatIds.size !== this.categories.length) {
      throw new TemplateValidationError(`Categories must have unique ids. Template name: ${name}`);
    }

    try {
      categories.forEach(category => {
        return new QuestionCategoryValidator(category);
      });
    } catch (error: unknown) {
      if (error instanceof TemplateValidationError) {
        throw new TemplateValidationError(`Template name ${name}. ${error.message}`);
      }
      throw error;
    }
  }
  name: string;
  categories: QuestionCategory[];
  examplesUrl: string;
  descriptionHtml?: string;
}

export class QuestionCategoryValidator {
  constructor({ id, name, description, questions }: QuestionCategory) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.questions = questions;

    const uniqueQuestionIds = new Set<number>(questions?.map(q => q.id) ?? []);

    if (uniqueQuestionIds.size !== questions?.length) {
      throw new TemplateValidationError(`Questions must have unique ids. Category ID: ${id}`);
    }
  }

  id: number;
  name: string;
  description?: string;
  questions?: Question[];
}
