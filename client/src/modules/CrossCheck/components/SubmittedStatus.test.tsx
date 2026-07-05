import { render, screen } from '@testing-library/react';
import { TaskSolution } from '@client/services/course';
import { SubmittedStatus } from './SubmittedStatus';

const solution = {
  url: 'https://github.com/student/solution',
  updatedDate: '2024-03-01T10:00:00.000Z',
} as TaskSolution;

describe('<SubmittedStatus />', () => {
  it('renders nothing when the task does not exist', () => {
    const { container } = render(<SubmittedStatus taskExists={false} solution={null} deadlinePassed={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('encourages submission when no solution and deadline has not passed', () => {
    render(<SubmittedStatus taskExists={true} solution={null} deadlinePassed={false} />);

    expect(screen.getByText(/Try to submit your solution as soon as possible/)).toBeInTheDocument();
  });

  it('warns about a passed deadline when no solution and deadline passed', () => {
    render(<SubmittedStatus taskExists={true} solution={null} deadlinePassed={true} />);

    expect(screen.getByText(/Submission deadline has already passed/)).toBeInTheDocument();
  });

  it('renders the submitted solution link when a solution exists', () => {
    render(<SubmittedStatus taskExists={true} solution={solution} deadlinePassed={false} />);

    const link = screen.getByRole('link', { name: solution.url });
    expect(link).toHaveAttribute('href', solution.url);
    expect(screen.getByText(/Submitted/)).toBeInTheDocument();
  });
});
