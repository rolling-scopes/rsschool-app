import { render, screen } from '@testing-library/react';
import CourseLinks from './CourseLinks';
import { LinkRenderData } from '@client/modules/Home/data/links';

describe('<CourseLinks />', () => {
  it('renders nothing when empty and maps supplied links', () => {
    const { container, rerender } = render(<CourseLinks courseLinks={[]} />);
    expect(container).toBeEmptyDOMElement();

    const courseLinks: LinkRenderData[] = [
      { name: 'Score', url: '/course/score?course=c1', icon: <span data-testid="icon-score" /> },
      { name: 'Schedule', url: '/course/schedule?course=c1', icon: <span data-testid="icon-schedule" /> },
    ];
    rerender(<CourseLinks courseLinks={courseLinks} />);

    const score = screen.getByRole('link', { name: /score/i });
    expect(score).toHaveAttribute('href', '/course/score?course=c1');
    expect(screen.getByRole('link', { name: /schedule/i })).toHaveAttribute('href', '/course/schedule?course=c1');
    expect(screen.getByTestId('icon-score')).toBeInTheDocument();
  });
});
