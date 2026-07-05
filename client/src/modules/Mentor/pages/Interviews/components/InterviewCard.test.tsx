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
  render(<InterviewCard interviewTask={task} course={COURSE} interviews={[]} fetchStudentInterviews={vi.fn()} />);
}

describe('InterviewCard', () => {
  it('should render the interview name as the card title', () => {
    renderCard();

    expect(screen.getByText('CoreJS Interview')).toBeInTheDocument();
  });

  it('should render the description when provided', () => {
    renderCard();

    expect(screen.getByText('Interview description')).toBeInTheDocument();
  });

  it('should not render a description paragraph when description is empty', () => {
    renderCard(makeTask({ description: '' }));

    expect(screen.queryByText('Interview description')).not.toBeInTheDocument();
  });

  it('should render a "Read more" link pointing to the description url', () => {
    renderCard();

    expect(screen.getByRole('link', { name: 'Read more' })).toHaveAttribute('href', 'https://docs.rs.school/interview');
  });

  it('should render the interview details child', () => {
    renderCard();

    expect(screen.getByText('interview-details')).toBeInTheDocument();
  });

  it('should render the interview period (start - end dates)', () => {
    renderCard();

    // InterviewPeriod renders the formatted start/end dates with a calendar icon
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });
});
