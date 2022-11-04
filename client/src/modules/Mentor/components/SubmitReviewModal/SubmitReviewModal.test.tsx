import { render, screen } from '@testing-library/react';
import { MODAL_TITLE, SubmitReviewModal, SubmitReviewModalProps } from '.';

const MODAL_DATA_MOCK = {
  courseTaskId: 1,
  maxScore: 100,
  resultScore: 20,
  solutionUrl: `solution-url`,
  studentGithubId: `student-github`,
  studentName: `Student Name`,
  taskDescriptionUrl: `task-url`,
  taskName: `Task Name`,
};

const PROPS_MOCK: SubmitReviewModalProps = {
  data: MODAL_DATA_MOCK,
  courseId: 1,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
};

describe('SubmitReviewModal', () => {
  it.each`
    text                           | role
    ${MODAL_DATA_MOCK.taskName}    | ${'link'}
    ${MODAL_DATA_MOCK.solutionUrl} | ${'link'}
    ${'Submit'}                    | ${'button'}
    ${'Cancel'}                    | ${'button'}
  `('should render $role "$text"', ({ text, role }: { text: string; role: string }) => {
    render(<SubmitReviewModal {...PROPS_MOCK} />);

    const element = screen.getByRole(role, { name: new RegExp(text) });

    expect(element).toBeInTheDocument();
  });

  it.each`
    text
    ${MODAL_DATA_MOCK.maxScore}
    ${MODAL_DATA_MOCK.studentName}
  `('should render field "$text"', ({ text }: { text: string }) => {
    render(<SubmitReviewModal {...PROPS_MOCK} />);

    const element = screen.getByText(new RegExp(text));

    expect(element).toBeInTheDocument();
  });

  it('should not render fields when data was not provided', () => {
    render(<SubmitReviewModal {...PROPS_MOCK} data={null} />);

    const modal = screen.queryByText(new RegExp(MODAL_TITLE));

    expect(modal).not.toBeInTheDocument();
  });
});
