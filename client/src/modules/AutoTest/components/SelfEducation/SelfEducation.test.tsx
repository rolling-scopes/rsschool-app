import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { SelfEducationPublicAttributes, SelfEducationQuestion } from 'services/course';
import { CourseTaskVerifications } from '../../types';
import SelfEducation from './SelfEducation';

describe('SelfEducation', () => {
  it('should show 10 questions when total question count is 15', () => {
    const NUMBER_OF_QUESTIONS = 10;
    const courseTask = {
      publicAttributes: {
        questions: generateQuestions(),
        numberOfQuestions: NUMBER_OF_QUESTIONS,
        maxAttemptsNumber: 2,
        tresholdPercentage: 90,
      } as SelfEducationPublicAttributes,
    } as CourseTaskVerifications;

    render(
      <Form>
        <SelfEducation courseTask={courseTask} />
      </Form>,
    );

    const questions = screen.getAllByText(/Self Education question/i);
    expect(questions).toHaveLength(NUMBER_OF_QUESTIONS);
  });
});

function generateQuestions(count = 15): SelfEducationQuestion[] {
  return new Array(count).fill({}).map((_, idx) => ({
    question: `Self Education question ${idx}`,
    answers: ['1'],
    multiple: false,
  }));
}
