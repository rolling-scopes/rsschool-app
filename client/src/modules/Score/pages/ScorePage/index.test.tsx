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

vi.mock('antd', () => ({
  Row: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Col: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, href }: React.ComponentProps<'a'>) => <a href={href}>{children}</a>,
  Result: ({
    title,
    subTitle,
    extra,
  }: {
    title: React.ReactNode;
    subTitle: React.ReactNode;
    extra: React.ReactNode;
  }) => (
    <main>
      <h1>{title}</h1>
      <p>{subTitle}</p>
      {extra}
    </main>
  ),
}));

describe('<ScorePage />', () => {
  it('renders course and no-access branches', () => {
    ctx.course = { id: 42, name: 'RS Course' };
    const { rerender } = render(<ScorePage />);

    const layout = screen.getByTestId('course-page-layout');
    expect(layout).toHaveAttribute('data-title', 'Score');
    expect(layout).toHaveAttribute('data-loading', 'false');
    expect(screen.getByTestId('score-table-tabs')).toBeInTheDocument();

    ctx.course = null;
    rerender(<ScorePage />);

    expect(screen.getByText(/You Have No Access to Course Page/i)).toBeInTheDocument();
    expect(screen.queryByTestId('score-table-tabs')).not.toBeInTheDocument();
  });
});
