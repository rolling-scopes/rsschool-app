import { render, screen } from '@testing-library/react';
import type { InterviewDto } from '@client/api';
import { TaskDtoTypeEnum } from '@client/api';
import type { Course } from '@client/services/models';
import { InterviewCard } from './InterviewCard';

// InterviewDetails is exercised in its own spec; stub it here so the card
// test stays focused on the card chrome (title, period, description, link).
vi.mock('./InterviewDetails', () => ({
  InterviewDetails: () => <div>interview-details</div>,
}));

const COURSE = { id: 400, alias: 'rs-2025' } as Course;

function makeTask(overrides: Partial<InterviewDto> = {}): InterviewDto {
  return {
    id: 99,
    name: 'CoreJS Interview',
    type: TaskDtoTypeEnum.Interview,
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    description: 'Interview description',
    descriptionUrl: 'https://docs.rs.school/interview',
    ...overrides,
  } as unknown as InterviewDto;
}

function renderCard(task = makeTask()) {
  return render(
    <InterviewCard interviewTask={task} course={COURSE} interviews={[]} fetchStudentInterviews={vi.fn()} />,
  );
}

describe('InterviewCard', () => {
  it('renders interview details and handles an empty description', () => {
    const { rerender } = renderCard();

    expect(screen.getByText('CoreJS Interview')).toBeInTheDocument();
    expect(screen.getByText('Interview description')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read more' })).toHaveAttribute('href', 'https://docs.rs.school/interview');
    expect(screen.getByText('interview-details')).toBeInTheDocument();
    expect(screen.getByText(/2025/)).toBeInTheDocument();

    rerender(
      <InterviewCard
        interviewTask={makeTask({ description: '' })}
        course={COURSE}
        interviews={[]}
        fetchStudentInterviews={vi.fn()}
      />,
    );
    expect(screen.queryByText('Interview description')).not.toBeInTheDocument();
  });
});
