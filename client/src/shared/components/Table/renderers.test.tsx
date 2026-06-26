/* eslint-disable testing-library/no-container, testing-library/no-node-access, testing-library/render-result-naming-convention */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  dateRenderer,
  dateUtcRenderer,
  crossCheckDateRenderer,
  crossCheckStatusRenderer,
  timeRenderer,
  dateTimeRenderer,
  shortDateTimeRenderer,
  dateWithTimeZoneRenderer,
  boolRenderer,
  buildCheckBoxRenderer,
  boolIconRenderer,
  colorTagRenderer,
  tagsRenderer,
  tagsCoursesRendererWithRemainingNumber,
  renderTag,
  stringTrimRenderer,
  idFromArrayRenderer,
  urlRenderer,
  weightRenderer,
  scoreRenderer,
  renderTask,
  coloredDateRenderer,
} from './renderers';

describe('Table renderers (string outputs)', () => {
  it('dateRenderer formats a date and returns empty for null', () => {
    expect(dateRenderer('2023-05-04T10:00:00.000Z')).toBe('2023-05-04');
    expect(dateRenderer(null)).toBe('');
  });

  it('dateUtcRenderer formats in UTC and returns empty for null', () => {
    expect(dateUtcRenderer('2023-05-04T23:30:00.000Z')).toBe('2023-05-04');
    expect(dateUtcRenderer(null)).toBe('');
  });

  it('crossCheckDateRenderer returns N/A for non cross-check checkers', () => {
    expect(crossCheckDateRenderer('2023-05-04T10:00:00.000Z', { checker: 'auto-test' as never })).toBe('N/A');
  });

  it('crossCheckDateRenderer formats date and shows "Not Set" when missing', () => {
    expect(crossCheckDateRenderer('2023-05-04T10:00:00.000Z', { checker: 'crossCheck' as never })).toBe('2023-05-04');
    expect(crossCheckDateRenderer(null, { checker: 'crossCheck' as never })).toBe('Not Set');
  });

  it('timeRenderer formats a time and returns empty for falsy', () => {
    expect(timeRenderer('10:30:00Z')).toBe('10:30');
    expect(timeRenderer('')).toBe('');
  });

  it('dateTimeRenderer formats date-time and returns empty for null', () => {
    expect(dateTimeRenderer('2023-05-04T10:30:00.000Z')).toBe('2023-05-04 10:30');
    expect(dateTimeRenderer(null)).toBe('');
  });

  it('shortDateTimeRenderer formats and returns empty for falsy', () => {
    expect(shortDateTimeRenderer('2023-05-04T10:30:00.000Z')).toBe('04.05 10:30');
    expect(shortDateTimeRenderer('')).toBe('');
  });

  it('dateWithTimeZoneRenderer applies the timezone and returns empty for falsy', () => {
    const r = dateWithTimeZoneRenderer('UTC', 'YYYY-MM-DD HH:mm');
    expect(r('2023-05-04T10:30:00.000Z')).toBe('2023-05-04 10:30');
    expect(r('')).toBe('');
  });

  it('boolRenderer stringifies values and returns empty for null', () => {
    expect(boolRenderer(true as never)).toBe('true');
    expect(boolRenderer(false as never)).toBe('false');
    expect(boolRenderer(null as never)).toBe('');
  });

  it('stringTrimRenderer truncates strings longer than 20 chars', () => {
    expect(stringTrimRenderer('short')).toBe('short');
    expect(stringTrimRenderer('a'.repeat(25))).toBe(`${'a'.repeat(20)}...`);
  });

  it('idFromArrayRenderer resolves names by id and falls back to (Empty)', () => {
    const r = idFromArrayRenderer([{ id: 1, name: 'One' }]);
    expect(r(1)).toBe('One');
    expect(r(99)).toBe('(Empty)');
  });
});

describe('Table renderers (cross-check status)', () => {
  it('returns N/A for non cross-check checkers', () => {
    expect(crossCheckStatusRenderer('done' as never, { checker: 'auto-test' as never })).toBe('N/A');
  });

  it('returns "Not distributed" for the initial status', () => {
    expect(crossCheckStatusRenderer('initial' as never, { checker: 'crossCheck' as never })).toBe('Not distributed');
  });

  it('renders a capitalized status span otherwise', () => {
    render(<>{crossCheckStatusRenderer('completed' as never, { checker: 'crossCheck' as never })}</>);
    expect(screen.getByText('completed')).toBeInTheDocument();
  });
});

describe('Table renderers (JSX outputs)', () => {
  it('buildCheckBoxRenderer renders a checkbox and reports changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const renderer = buildCheckBoxRenderer<{ id: number }>(['active'], onChange);
    render(<>{renderer(false, { id: 1 })}</>);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);

    expect(onChange).toHaveBeenCalledWith(['active'], { id: 1 }, true);
  });

  it('buildCheckBoxRenderer treats undefined as true when configured', () => {
    const renderer = buildCheckBoxRenderer<{ id: number }>(['active'], vi.fn(), true);
    render(<>{renderer(undefined as never, { id: 1 })}</>);

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('boolIconRenderer renders a check icon for truthy and minus icon for falsy', () => {
    const { rerender, container } = render(<>{boolIconRenderer(true)}</>);
    expect(container.querySelector('.anticon-check-circle')).toBeInTheDocument();

    rerender(<>{boolIconRenderer(false)}</>);
    expect(container.querySelector('.anticon-minus-circle')).toBeInTheDocument();
  });

  it('colorTagRenderer renders a tag with the value', () => {
    render(<>{colorTagRenderer('JS', 'blue')}</>);
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('tagsRenderer renders a tag per value and empty string for non-arrays', () => {
    render(<>{tagsRenderer(['a', 'b'])}</>);
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();

    expect(tagsRenderer('nope' as never)).toBe('');
  });

  it('renderTag renders an antd tag', () => {
    render(<>{renderTag('label', 'green')}</>);
    expect(screen.getByText('label')).toBeInTheDocument();
  });

  it('weightRenderer formats weight and returns null when null', () => {
    render(<>{weightRenderer(1.5)}</>);
    expect(screen.getByText('×1.5')).toBeInTheDocument();
    expect(weightRenderer(null)).toBeNull();
  });

  it('scoreRenderer shows score/maxScore and returns null when maxScore missing', () => {
    render(<>{scoreRenderer({ score: 50, maxScore: 100 } as never)}</>);
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
    expect(scoreRenderer({ score: 50, maxScore: null } as never)).toBeNull();
  });

  it('scoreRenderer defaults a missing score to 0', () => {
    render(<>{scoreRenderer({ score: null, maxScore: 100 } as never)}</>);
    expect(screen.getByText('0 / 100')).toBeInTheDocument();
  });

  it('renderTask renders plain name without a url, and a link with one', () => {
    const { rerender } = render(<>{renderTask('Task A', null)}</>);
    expect(screen.getByText('Task A')).toBeInTheDocument();

    rerender(<>{renderTask('Task B', 'https://example.com')}</>);
    expect(screen.getByRole('link', { name: 'Task B' })).toHaveAttribute('href', 'https://example.com');
  });
});

describe('urlRenderer', () => {
  it('returns false for empty urls', () => {
    expect(urlRenderer('')).toBe(false);
  });

  it('renders a github icon for github links', () => {
    const { container } = render(<>{urlRenderer('https://github.com/x')}</>);
    expect(container.querySelector('.anticon-github')).toBeInTheDocument();
  });

  it('renders a youtube icon for youtube links', () => {
    const { container } = render(<>{urlRenderer('https://youtu.be/x')}</>);
    expect(container.querySelector('.anticon-youtube')).toBeInTheDocument();
  });

  it('renders a chrome icon for other links', () => {
    const { container } = render(<>{urlRenderer('https://example.com')}</>);
    expect(container.querySelector('.anticon-chrome')).toBeInTheDocument();
  });
});

describe('tagsCoursesRendererWithRemainingNumber', () => {
  it('returns undefined when there are no courses', () => {
    expect(tagsCoursesRendererWithRemainingNumber(undefined, { courses: [] } as never)).toBeUndefined();
  });

  it('renders the first course and a "+N More" tag when there are extras', () => {
    render(
      <>
        {tagsCoursesRendererWithRemainingNumber(undefined, {
          courses: [{ name: 'Course A', isActive: true }, { name: 'Course B' }, { name: 'Course C' }],
        } as never)}
      </>,
    );

    expect(screen.getByText('Course A')).toBeInTheDocument();
    expect(screen.getByText('+ 2 More')).toBeInTheDocument();
  });

  it('renders just the first course when there are no extras', () => {
    render(<>{tagsCoursesRendererWithRemainingNumber(undefined, { courses: [{ name: 'Solo' }] } as never)}</>);

    expect(screen.getByText('Solo')).toBeInTheDocument();
    expect(screen.queryByText(/More/)).not.toBeInTheDocument();
  });
});

describe('coloredDateRenderer', () => {
  const renderColored = (item: Record<string, unknown>) => {
    const renderer = coloredDateRenderer('UTC', 'YYYY-MM-DD', 'end', 'Self-study info');
    return render(<>{renderer('2023-05-04T00:00:00.000Z', item as never)}</>);
  };

  it('renders the formatted date text', () => {
    renderColored({ startDate: '2023-05-01', endDate: '2023-05-10', score: null, tag: 'task' });
    expect(screen.getByText('2023-05-04')).toBeInTheDocument();
  });

  it('renders an info tooltip icon for self-study tasks', () => {
    const { container } = renderColored({
      startDate: '2023-05-01',
      endDate: '2023-05-10',
      score: null,
      tag: 'self-study',
    });
    expect(container.querySelector('.anticon-info-circle')).toBeInTheDocument();
  });

  it('applies a warning color when the deadline is within 48 hours (end date)', () => {
    const soon = new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString();
    const renderer = coloredDateRenderer('UTC', 'YYYY-MM-DD', 'end', 'info');
    const { container } = render(
      <>{renderer(soon, { startDate: '2000-01-01', endDate: soon, score: null, tag: 'task' } as never)}</>,
    );
    expect(container.querySelector('.ant-typography-warning')).toBeInTheDocument();
  });

  it('applies a success color for a current task on the start column', () => {
    const start = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const end = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString();
    const renderer = coloredDateRenderer('UTC', 'YYYY-MM-DD', 'start', 'info');
    const { container } = render(
      <>{renderer(start, { startDate: start, endDate: end, score: null, tag: 'task' } as never)}</>,
    );
    expect(container.querySelector('.ant-typography-success')).toBeInTheDocument();
  });

  it('applies a secondary color for a scored (past) task', () => {
    const renderer = coloredDateRenderer('UTC', 'YYYY-MM-DD', 'end', 'info');
    const { container } = render(
      <>
        {renderer('2020-01-01', { startDate: '2019-01-01', endDate: '2020-01-01', score: 80, tag: 'task' } as never)}
      </>,
    );
    expect(container.querySelector('.ant-typography-secondary')).toBeInTheDocument();
  });
});
