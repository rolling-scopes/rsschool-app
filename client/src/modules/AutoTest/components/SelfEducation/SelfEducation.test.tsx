import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { SelfEducationPublicAttributes, SelfEducationQuestion } from 'services/course';
import { CourseTaskVerifications } from '../../types';
import SelfEducation from './SelfEducation';

describe('SelfEducation', () => {
  it('should show 10 questions when total question count is 15', () => {
    const NUMBER_OF_QUESTIONS = 10;
    renderSelfEducation({ numberOfQuestions: NUMBER_OF_QUESTIONS });

    const questions = screen.getAllByRole('heading', { name: /question-/i });
    expect(questions).toHaveLength(NUMBER_OF_QUESTIONS);
  });

  it.each`
    type          | multiple
    ${'radio'}    | ${false}
    ${'checkbox'} | ${true}
  `(
    "should render $type when question's multiple option is $multiple",
    ({ type, multiple }: { type: string; multiple: boolean }) => {
      renderSelfEducation({ questions: [generateQuestion({ multiple })] });

      const question = screen.getByLabelText(/answer-0/i);
      expect(question).toHaveClass(`ant-${type}-input`);
    },
  );

  it.each`
    condition                     | question
    ${'image in question'}        | ${{ questionImage: 'some-image-url' }}
    ${'image in radio answer'}    | ${{ answersType: 'image', answers: ['some-image-url'] }}
    ${'image in checkbox answer'} | ${{ answersType: 'image', answers: ['some-image-url'], multiple: true }}
  `('should render image when question has $condition', ({ question }: { question: SelfEducationQuestion }) => {
    renderSelfEducation({ questions: [generateQuestion(question)] });

    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
  });
});

function renderSelfEducation({ numberOfQuestions = 5, questions = generateQuestions() }) {
  const courseTask = {
    publicAttributes: {
      questions,
      numberOfQuestions,
      maxAttemptsNumber: 2,
      tresholdPercentage: 90,
    } as SelfEducationPublicAttributes,
  } as CourseTaskVerifications;

  return render(
    <Form>
      <SelfEducation courseTask={courseTask} />
    </Form>,
  );
}

function generateQuestion({
  question = 'question-0',
  answers = ['answer-0', 'answer-1'],
  multiple = false,
  answersType,
  questionImage,
}: Partial<SelfEducationQuestion>): SelfEducationQuestion {
  return {
    question,
    answers,
    multiple,
    answersType,
    questionImage,
  };
}

function generateQuestions(count = 15): SelfEducationQuestion[] {
  return new Array(count).fill({}).map((_, idx) => {
    const question = `Question-${idx}`;
    const answers = new Array(2).fill('').map((_, index) => `${question} Answer-${index}`);

    return generateQuestion({
      question,
      answers,
      multiple: false,
    });
  });
}
