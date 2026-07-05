import { render, screen } from '@testing-library/react';
import { ScorePage } from './index';

// --- Boundary mocks --------------------------------------------------------

// The active-course context drives the no-access vs. table branch; the value is swapped
// per test through this mutable holder.
const { ctx } = vi.hoisted(() => ({
  ctx: { course: { id: 42, name: 'RS Course' } as { id: number; name: string } | null },
}));

vi.mock('@client/modules/Course/contexts', async () => {
  const { createContext } = await vi.importActual<typeof import('react')>('react');
  return {
    SessionContext: createContext({ githubId: 'tester' }),
    useActiveCourseContext: () => ctx,
  };
});

// CoursePageLayout wraps the page chrome (header, course switching). Render a thin marker
// that exposes the title + loading flag and its children so we can assert the table wiring.
vi.mock('@client/components/CoursePageLayout', () => ({
  CoursePageLayout: (props: { title: string; loading: boolean; children: React.ReactNode }) => (
    <div data-testid="course-page-layout" data-title={props.title} data-loading={String(props.loading)}>
      {props.children}
    </div>
  ),
}));

// ScoreTableTabs is the heavy data-loading table; stub it to a marker.
vi.mock('@client/modules/Score/components/ScoreTable/ScoreTableTabs', () => ({
  ScoreTableTabs: () => <div data-testid="score-table-tabs" />,
}));

describe('<ScorePage />', () => {
  it('renders the score table layout when a course is available', () => {
    ctx.course = { id: 42, name: 'RS Course' };
    render(<ScorePage />);

    const layout = screen.getByTestId('course-page-layout');
    expect(layout).toHaveAttribute('data-title', 'Score');
    expect(layout).toHaveAttribute('data-loading', 'false');
    expect(screen.getByTestId('score-table-tabs')).toBeInTheDocument();
  });

  it('renders the no-access view when there is no active course', () => {
    ctx.course = null;
    render(<ScorePage />);

    expect(screen.getByText(/You Have No Access to Course Page/i)).toBeInTheDocument();
    expect(screen.queryByTestId('score-table-tabs')).not.toBeInTheDocument();
  });
});
