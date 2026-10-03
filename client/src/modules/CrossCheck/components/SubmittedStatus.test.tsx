import { render, screen } from '@testing-library/react';
import { TaskSolution } from '@client/services/course';
import type { ReactNode } from 'react';
import { SubmittedStatus } from './SubmittedStatus';

vi.mock('antd', () => ({
  Alert: ({ title, message }: { title?: ReactNode; message?: ReactNode }) => <div role="alert">{title ?? message}</div>,
}));

const solution = {
  url: 'https://github.com/student/solution',
  updatedDate: '2024-03-01T10:00:00.000Z',
} as TaskSolution;

describe('<SubmittedStatus />', () => {
  it('renders each task and submission state', () => {
    const { container, rerender } = render(
      <SubmittedStatus taskExists={false} solution={null} deadlinePassed={false} />,
    );

    expect(container).toBeEmptyDOMElement();

    rerender(<SubmittedStatus taskExists={true} solution={null} deadlinePassed={false} />);

    expect(screen.getByText(/Try to submit your solution as soon as possible/)).toBeInTheDocument();

    rerender(<SubmittedStatus taskExists={true} solution={null} deadlinePassed={true} />);

    expect(screen.getByText(/Submission deadline has already passed/)).toBeInTheDocument();

    rerender(<SubmittedStatus taskExists={true} solution={solution} deadlinePassed={false} />);

    const link = screen.getByRole('link', { name: solution.url });
    expect(link).toHaveAttribute('href', solution.url);
    expect(screen.getByText(/Submitted/)).toBeInTheDocument();
  });
});
