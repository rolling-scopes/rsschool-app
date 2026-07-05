/* eslint-disable testing-library/no-node-access */
// antd wires its Select option handler on the `.ant-select-item-option` wrapper, which has
// no stable role/label hook, so one `document.querySelector` on that node is unavoidable
// (mirrors LocationSelect.test.tsx).
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ReactNode, useEffect, useState } from 'react';
import { CourseTaskDto } from '@client/api';
import { TaskPerformanceCard } from './TaskPerformanceCard';

// --- Boundary & collaborator mocks -----------------------------------------

// next/dynamic: resolve the lazily-imported DonutChart synchronously.
vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<{ default: (p: Record<string, unknown>) => ReactNode }>) => {
    const Lazy = (props: Record<string, unknown>) => {
      const [Comp, setComp] = useState<((p: Record<string, unknown>) => ReactNode) | null>(null);
      useEffect(() => {
        loader().then(m => setComp(() => m.default));
      }, []);
      return Comp ? <Comp {...props} /> : null;
    };
    return Lazy;
  },
}));

// Brittle-widget stub: canvas DonutChart → marker exposing the data points it receives
// (already filtered to value > 0 by the card) so we assert the chart-data shaping. The
// full `config` is captured so we can exercise the tooltip item formatter + render fn
// (which map performance types → human descriptions) without a real chart.
type DonutConfigLike = {
  tooltip?: { items?: Array<(d: Record<string, string | number>) => { name: string; value: string | number }> };
  interaction?: {
    tooltip?: {
      render?: (e: unknown, ctx: { items: Array<{ name: string; value: string | number; color?: string }> }) => string;
    };
  };
};
const { lastDonutConfig } = vi.hoisted(() => ({ lastDonutConfig: { current: null as DonutConfigLike | null } }));

vi.mock('../DonutChart/DonutChart', () => ({
  default: ({ data, config }: { data: { type: string; value: number }[]; config?: DonutConfigLike }) => {
    lastDonutConfig.current = config ?? null;
    return <div data-testid="donut-chart" data-length={data.length} data-types={data.map(d => d.type).join(',')} />;
  },
}));

// Active course context: provide the course id used in the API call.
vi.mock('@client/modules/Course/contexts', () => ({
  useActiveCourseContext: () => ({ course: { id: 77 } }),
}));

// API boundary: stub getTaskPerformance.
const { getTaskPerformance } = vi.hoisted(() => ({
  getTaskPerformance: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CourseStatsApi: function CourseStatsApi() {
    return { getTaskPerformance };
  },
}));

const tasks: CourseTaskDto[] = [
  { id: 1, name: 'Task Alpha' } as CourseTaskDto,
  { id: 2, name: 'Task Beta' } as CourseTaskDto,
];

// antd wires its select handler on the `.ant-select-item-option` wrapper element, so we
// click that node (matched by its label) rather than the inner content node.
function selectOption(name: string) {
  fireEvent.mouseDown(screen.getByRole('combobox'));
  const option = Array.from(document.querySelectorAll('.ant-select-item-option')).find(
    el => el.getAttribute('title') === name,
  );
  fireEvent.click(option as Element);
}

const performance = {
  totalAchievement: 10,
  minimalAchievement: 1,
  lowAchievement: 0,
  moderateAchievement: 3,
  highAchievement: 0,
  exceptionalAchievement: 2,
  perfectScores: 4,
};

describe('<TaskPerformanceCard />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the title and the task select', () => {
    render(<TaskPerformanceCard tasks={tasks} />);

    expect(screen.getByText('Task Performance')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows the empty-state prompt before a task is selected', () => {
    render(<TaskPerformanceCard tasks={tasks} />);

    expect(screen.getByText(/no data available for this task/i)).toBeInTheDocument();
    expect(screen.queryByTestId('donut-chart')).not.toBeInTheDocument();
  });

  it('lists the provided tasks as select options', () => {
    render(<TaskPerformanceCard tasks={tasks} />);

    fireEvent.mouseDown(screen.getByRole('combobox'));

    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByRole('option', { name: 'Task Alpha' })).toBeInTheDocument();
    expect(within(listbox).getByRole('option', { name: 'Task Beta' })).toBeInTheDocument();
  });

  it('fetches performance and renders the donut with only non-zero buckets on selection', async () => {
    getTaskPerformance.mockResolvedValue({ data: performance });
    render(<TaskPerformanceCard tasks={tasks} />);

    selectOption('Task Alpha');

    await waitFor(() => {
      expect(getTaskPerformance).toHaveBeenCalledWith(77, 1);
    });

    const chart = await screen.findByTestId('donut-chart');
    // Non-zero buckets: Minimal(1), Moderate(3), Exceptional(2), Perfect(4) → 4 points.
    expect(chart).toHaveAttribute('data-length', '4');
    expect(chart).toHaveAttribute('data-types', 'Minimal,Moderate,Exceptional,Perfect');
  });

  it('keeps the empty state when the selected task has no achievements', async () => {
    getTaskPerformance.mockResolvedValue({ data: { ...performance, totalAchievement: 0 } });
    render(<TaskPerformanceCard tasks={tasks} />);

    selectOption('Task Beta');

    await waitFor(() => {
      expect(getTaskPerformance).toHaveBeenCalledWith(77, 2);
    });
    expect(screen.getByText(/no data available for this task/i)).toBeInTheDocument();
    expect(screen.queryByTestId('donut-chart')).not.toBeInTheDocument();
  });

  describe('chart config (tooltip mapping)', () => {
    async function captureChartConfig() {
      getTaskPerformance.mockResolvedValue({ data: performance });
      render(<TaskPerformanceCard tasks={tasks} />);
      selectOption('Task Alpha');
      await screen.findByTestId('donut-chart');
      return lastDonutConfig.current;
    }

    it('maps each performance type to its human-readable description via the tooltip item', async () => {
      const chartConfig = await captureChartConfig();
      const formatItem = chartConfig?.tooltip?.items?.[0];

      expect(formatItem?.({ type: 'Minimal', value: 1 })).toEqual({
        name: 'Number of students scoring between 1% and 20% of the maximum points',
        value: 1,
      });
      expect(formatItem?.({ type: 'Low', value: 2 }).name).toMatch(/21% and 50%/);
      expect(formatItem?.({ type: 'Moderate', value: 3 }).name).toMatch(/51% and 70%/);
      expect(formatItem?.({ type: 'High', value: 4 }).name).toMatch(/71% and 90%/);
      expect(formatItem?.({ type: 'Exceptional', value: 5 }).name).toMatch(/91% and 99%/);
      expect(formatItem?.({ type: 'Perfect', value: 6 }).name).toMatch(/perfect score of 100%/);
    });

    it('falls back to the Unknown description for an unrecognised type', async () => {
      const chartConfig = await captureChartConfig();
      const formatItem = chartConfig?.tooltip?.items?.[0];

      expect(formatItem?.({ type: 'Mystery', value: 9 }).name).toBe('Unknown performance category');
    });

    it('renders the tooltip HTML containing the mapped name and value', async () => {
      const chartConfig = await captureChartConfig();
      // `render` here is the antd chart tooltip renderer, not Testing Library's render.
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const tooltipHtml = chartConfig?.interaction?.tooltip?.render?.(null, {
        items: [{ name: 'Perfect scorers', value: 4, color: '#fff' }],
      });

      expect(tooltipHtml).toContain('Perfect scorers');
      expect(tooltipHtml).toContain('<strong>4</strong>');
    });
  });
});
