import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { SelfEducationQuestionSelectedAnswersDto } from '@client/api';
import Question from './Question';

function renderQuestion(question: Partial<SelfEducationQuestionSelectedAnswersDto>) {
  return render(
    <Form>
      <Question
        question={
          {
            question: 'What is 2 + 2?',
            answers: ['3', '4', '5'],
            multiple: false,
            selectedAnswers: [],
            ...question,
          } as SelfEducationQuestionSelectedAnswersDto
        }
      />
    </Form>,
  );
}

describe('Question', () => {
  it('should render the question title and its answers', () => {
    renderQuestion({});

    expect(screen.getByRole('heading', { name: 'What is 2 + 2?' })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it.each`
    multiple | role
    ${false} | ${'radio'}
    ${true}  | ${'checkbox'}
  `('should render $role inputs when multiple is $multiple', ({ multiple, role }) => {
    renderQuestion({ multiple });

    expect(screen.getAllByRole(role)).toHaveLength(3);
  });

  it('should mark the selected answer as checked', () => {
    renderQuestion({ multiple: false, selectedAnswers: [1] });

    const radios = screen.getAllByRole('radio');
    expect(radios[1]).toBeChecked();
    expect(radios[0]).not.toBeChecked();
  });

  it('should render the question image when provided', () => {
    renderQuestion({ questionImage: 'question-image-url' });

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'question-image-url');
  });

  it('should render image answers with their index prefix', () => {
    renderQuestion({ answersType: 'image', answers: ['answer-image-1', 'answer-image-2'] });

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'answer-image-1');

    // Image answers are prefixed with their 1-based index, e.g. "(1)", "(2)".
    expect(screen.getByText(/\(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
  });
});
