import { InterviewTemplate, QuestionCategory } from '@client/data/interviews/types';

export class TemplateValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateValidationError';
  }
}

export function interviewTemplateValidator(template: InterviewTemplate): InterviewTemplate {
  const { name, categories } = template;

  const uniqueCatIds = new Set<number>(categories.map(c => c.id));

  if (uniqueCatIds.size !== categories.length) {
    throw new TemplateValidationError(`Categories must have unique ids. Template name: ${name}`);
  }

  try {
    categories.forEach(category => {
      questionCategoryValidator(category);
    });
  } catch (error: unknown) {
    if (error instanceof TemplateValidationError) {
      throw new TemplateValidationError(`Template name ${name}. ${error.message}`);
    }
    throw error;
  }

  return template;
}

export function questionCategoryValidator(category: QuestionCategory): QuestionCategory {
  const { id, questions } = category;

  const uniqueQuestionIds = new Set<number>(questions.map(q => q.id) ?? []);

  if (uniqueQuestionIds.size !== questions.length) {
    throw new TemplateValidationError(`Questions must have unique ids. Category ID: ${id}`);
  }

  return category;
}
