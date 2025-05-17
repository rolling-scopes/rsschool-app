import { fireEvent, render, screen } from '@testing-library/react';
import { MentorDashboardDto } from 'api';
import mockAxios from 'jest-mock-axios';
import { MODAL_TITLE, SubmitReviewModal, SubmitReviewModalProps } from '.';
import { SUCCESS_MESSAGE } from './SubmitReviewModal';

const MODAL_DATA_MOCK = {
  courseTaskId: 1,
  maxScore: 100,
  resultScore: 20,
  solutionUrl: `solution-url`,
  studentGithubId: `student-github`,
  studentName: `Student Name`,
  taskDescriptionUrl: `task-url`,
  taskName: `Task Name`,
} as MentorDashboardDto;

const PROPS_MOCK: SubmitReviewModalProps = {
  data: MODAL_DATA_MOCK,
  courseId: 1,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
};

describe('SubmitReviewModal', () => {
  afterEach(() => {
    mockAxios.reset();
  });

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

  it('should render success message on submit', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: true });
    render(<SubmitReviewModal {...PROPS_MOCK} />);
    const scoreInput = screen.getByRole('spinbutton', { name: /score \(max 100 points\)/i });
    fireEvent.change(scoreInput, { target: { value: 10 } });

    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitBtn);

    const message = await screen.findByText(SUCCESS_MESSAGE);
    expect(message).toBeInTheDocument();
  });

  it('should render error message when error has occurred on submit', async () => {
    const errorMessage = 'Network error';
    mockAxios.post.mockRejectedValueOnce(new Error(errorMessage));
    render(<SubmitReviewModal {...PROPS_MOCK} />);
    const scoreInput = screen.getByRole('spinbutton', { name: /score \(max 100 points\)/i });
    fireEvent.change(scoreInput, { target: { value: 10 } });

    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitBtn);

    const message = await screen.findByText(errorMessage);
    expect(message).toBeInTheDocument();
  });

  it('should call onClose when "Cancel" button was clicked', async () => {
    render(<SubmitReviewModal {...PROPS_MOCK} />);
    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });

    fireEvent.click(cancelBtn);

    expect(PROPS_MOCK.onClose).toHaveBeenCalledWith(null);
  });
});
