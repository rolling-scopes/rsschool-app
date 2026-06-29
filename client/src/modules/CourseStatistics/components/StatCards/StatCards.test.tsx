import { render, screen, waitFor } from '@testing-library/react';
import { CourseAggregateStatsDto } from '@client/api';
import { StatCards } from './StatCards';

// --- Collaborator markers --------------------------------------------------
// StatCards is pure composition + conditional inclusion logic. Replace each child card
// with a marker so we assert *which* cards are rendered for a given data shape and what
// counts they receive — without pulling charts into jsdom.

vi.mock('@client/modules/Course/contexts', () => ({
  useActiveCourseContext: () => ({ course: { id: 42 } }),
}));

const { getCourseTasks } = vi.hoisted(() => ({
  getCourseTasks: vi.fn().mockResolvedValue({ data: [{ id: 1, name: 'T1' }] }),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CoursesTasksApi: function CoursesTasksApi() {
    return { getCourseTasks };
  },
}));

vi.mock('@client/modules/CourseStatistics/components/StudentsCountriesCard', () => ({
  StudentsCountriesCard: ({ activeStudentsCount }: { activeStudentsCount: number }) => (
    <div data-testid="card-students-countries">{activeStudentsCount}</div>
  ),
}));
vi.mock('@client/modules/CourseStatistics/components/StudentsStatsCard', () => ({
  StudentsStatsCard: () => <div data-testid="card-students-stats" />,
}));
vi.mock('@client/modules/CourseStatistics/components/MentorsCountriesCard/MentorsCountriesCard', () => ({
  MentorsCountriesCard: ({ activeCount }: { activeCount: number }) => (
    <div data-testid="card-mentors-countries">{activeCount}</div>
  ),
}));
vi.mock('@client/modules/CourseStatistics/components/EpamMentorsStatsCard', () => ({
  EpamMentorsStatsCard: () => <div data-testid="card-epam-mentors" />,
}));
vi.mock('@client/modules/CourseStatistics/components/StudentsWithMentorsCard', () => ({
  StudentsWithMentorsCard: () => <div data-testid="card-with-mentors" />,
}));
vi.mock('@client/modules/CourseStatistics/components/StudentsWithCertificateCard', () => ({
  StudentsWithCertificateCard: () => <div data-testid="card-with-certificate" />,
}));
vi.mock('@client/modules/CourseStatistics/components/StudentsEligibleForCertificationCard', () => ({
  StudentsEligibleForCertificationCard: () => <div data-testid="card-eligible" />,
}));
vi.mock('@client/modules/CourseStatistics/components/TaskPerformanceCard', () => ({
  TaskPerformanceCard: ({ tasks }: { tasks: { id: number }[] }) => (
    <div data-testid="card-task-performance" data-tasks={tasks.length} />
  ),
}));
vi.mock('@client/modules/CourseStatistics/components/StudentsCertificatesCountriesCard', () => ({
  StudentsCertificatesCountriesCard: ({ certificatesCount }: { certificatesCount: number }) => (
    <div data-testid="card-certificates-countries">{certificatesCount}</div>
  ),
}));

// react-masonry-css renders children in a passthrough container in jsdom; keep real.

function makeData(overrides: Partial<CourseAggregateStatsDto> = {}): CourseAggregateStatsDto {
  return {
    studentsCountries: { countries: [{ countryName: 'Poland', count: 10 }] },
    studentsStats: {
      activeStudentsCount: 80,
      totalStudents: 120,
      studentsWithMentorCount: 60,
      certifiedStudentsCount: 20,
      eligibleForCertificationCount: 40,
    },
    mentorsCountries: { countries: [{ countryName: 'Poland', count: 5 }] },
    mentorsStats: { mentorsActiveCount: 14, mentorsTotalCount: 20, epamMentorsCount: 6 },
    courseTasks: [{ id: 1 } as never],
    studentsCertificatesCountries: { countries: [{ countryName: 'Poland', count: 3 }] },
    ...overrides,
  };
}

describe('<StatCards />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders nothing-meaningful when no data is provided', () => {
    render(<StatCards />);

    expect(screen.queryByTestId('card-students-stats')).not.toBeInTheDocument();
    expect(screen.queryByTestId('card-epam-mentors')).not.toBeInTheDocument();
  });

  it('renders the full set of cards for fully-populated data with certified students', async () => {
    render(<StatCards coursesData={makeData()} />);

    expect(screen.getByTestId('card-students-countries')).toHaveTextContent('80');
    expect(screen.getByTestId('card-students-stats')).toBeInTheDocument();
    expect(screen.getByTestId('card-mentors-countries')).toHaveTextContent('14');
    expect(screen.getByTestId('card-epam-mentors')).toBeInTheDocument();
    expect(screen.getByTestId('card-with-mentors')).toBeInTheDocument();
    expect(screen.getByTestId('card-with-certificate')).toBeInTheDocument();
    expect(screen.getByTestId('card-certificates-countries')).toHaveTextContent('20');

    // certified > 0 → eligible card is hidden.
    expect(screen.queryByTestId('card-eligible')).not.toBeInTheDocument();

    // Task performance appears only after courseTasks resolve.
    const taskCard = await screen.findByTestId('card-task-performance');
    expect(taskCard).toBeInTheDocument();
    await waitFor(() => expect(getCourseTasks).toHaveBeenCalledWith(42));
  });

  it('shows the eligible card (and hides certificate cards) when no students are certified', () => {
    const data = makeData({
      studentsStats: {
        activeStudentsCount: 80,
        totalStudents: 120,
        studentsWithMentorCount: 60,
        certifiedStudentsCount: 0,
        eligibleForCertificationCount: 40,
      },
    });
    render(<StatCards coursesData={data} />);

    expect(screen.getByTestId('card-eligible')).toBeInTheDocument();
    expect(screen.queryByTestId('card-with-certificate')).not.toBeInTheDocument();
    expect(screen.queryByTestId('card-certificates-countries')).not.toBeInTheDocument();
  });

  it('hides the mentors-countries card when there are no active mentors', () => {
    const data = makeData({
      mentorsStats: { mentorsActiveCount: 0, mentorsTotalCount: 0, epamMentorsCount: 0 },
    });
    render(<StatCards coursesData={data} />);

    expect(screen.queryByTestId('card-mentors-countries')).not.toBeInTheDocument();
    expect(screen.queryByTestId('card-epam-mentors')).not.toBeInTheDocument();
  });
});
