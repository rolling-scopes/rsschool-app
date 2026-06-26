/* eslint-disable testing-library/no-node-access */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from 'next/router';
import { ScoreTableTabs } from './ScoreTableTabs';

// Brittle/heavy collaborator: <ScoreTable /> loads remote score data, builds an antd
// Table with virtualized columns and a Drawer. ScoreTableTabs only WIRES the tabs,
// export button and the settings toggle; render a minimal controlled stub that surfaces
// the props the tabs component drives (activeOnly + the settings visibility flag) so we
// can assert tab switching and the settings-open behaviour without the real table.
vi.mock('@client/modules/Score/components/ScoreTable/index', () => ({
  ScoreTable: (props: { activeOnly: boolean; isVisibleSetting: boolean }) => (
    <div
      data-testid="score-table"
      data-active-only={String(props.activeOnly)}
      data-settings-open={String(props.isVisibleSetting)}
    />
  ),
}));

const { getExportCsvUrl, isExportEnabled } = vi.hoisted(() => ({
  getExportCsvUrl: vi.fn(() => '/api/v2/course/42/students/score/csv?cityName=Minsk'),
  isExportEnabled: vi.fn(() => true),
}));

vi.mock('@client/modules/Score/data/getExportCsvUrl', () => ({ getExportCsvUrl }));
vi.mock('@client/modules/Score/data/isExportEnabled', () => ({ isExportEnabled }));

function makeProps() {
  return {
    tabProps: {
      course: { id: 42, name: 'Test Course' },
      session: { githubId: 'tester', isAdmin: true },
      onLoading: vi.fn(),
    },
  } as unknown as Parameters<typeof ScoreTableTabs>[0];
}

// The settings button has only an icon (title="Settings") so it has no accessible text
// name; query it by its title attribute instead.
const getSettingsButton = () => screen.getAllByRole('button').find(b => b.getAttribute('title') === 'Settings')!;

describe('<ScoreTableTabs />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getExportCsvUrl.mockReturnValue('/api/v2/course/42/students/score/csv?cityName=Minsk');
    isExportEnabled.mockReturnValue(true);
    vi.mocked(useRouter).mockReturnValue({
      query: { cityName: 'Minsk', ['mentor.githubId']: 'mentor1' },
      push: vi.fn(),
      pathname: '/',
    } as never);
  });

  it('renders "All students" and "Active students" tabs, defaulting to Active', () => {
    render(<ScoreTableTabs {...makeProps()} />);

    expect(screen.getByRole('tab', { name: /all students/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /active students/i })).toBeInTheDocument();

    // Default active tab = "active" → its ScoreTable has activeOnly=true.
    const activeTable = screen.getByTestId('score-table');
    expect(activeTable).toHaveAttribute('data-active-only', 'true');
  });

  it('switches to the "All students" tab and renders the activeOnly=false table', async () => {
    render(<ScoreTableTabs {...makeProps()} />);

    fireEvent.click(screen.getByRole('tab', { name: /all students/i }));

    // antd keeps both panels mounted after a switch; assert the now-visible panel's
    // table is the activeOnly=false ("All students") one.
    await waitFor(() => {
      const allTab = screen.getByRole('tab', { name: /all students/i });
      expect(allTab).toHaveAttribute('aria-selected', 'true');
    });
    const visiblePanel = screen.getByRole('tabpanel');
    expect(within(visiblePanel).getByTestId('score-table')).toHaveAttribute('data-active-only', 'false');
  });

  it('opens the settings (passes isVisibleSetting=true to the table) when the settings button is clicked', async () => {
    const user = userEvent.setup();
    render(<ScoreTableTabs {...makeProps()} />);

    expect(screen.getByTestId('score-table')).toHaveAttribute('data-settings-open', 'false');

    await user.click(getSettingsButton());

    await waitFor(() => {
      expect(screen.getByTestId('score-table')).toHaveAttribute('data-settings-open', 'true');
    });
  });

  it('navigates to the CSV export URL (built from course id + query filters) on export click', async () => {
    const user = userEvent.setup();
    render(<ScoreTableTabs {...makeProps()} />);

    // The export click sets window.location.href; stub the assignment to capture it.
    const hrefSetter = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        set href(v: string) {
          hrefSetter(v);
        },
      },
    });

    // ExportCsvButton has no text label — it is the FileExcel icon button (not the
    // Settings button). Click the export button found among the extra-content buttons.
    const buttons = screen.getAllByRole('button');
    const exportBtn = buttons.find(b => b.querySelector('.anticon-file-excel'));
    expect(exportBtn).toBeTruthy();
    await user.click(exportBtn!);

    expect(getExportCsvUrl).toHaveBeenCalledWith(42, 'Minsk', 'mentor1');
    expect(hrefSetter).toHaveBeenCalledWith('/api/v2/course/42/students/score/csv?cityName=Minsk');
  });

  it('hides the export button when export is not enabled', () => {
    isExportEnabled.mockReturnValue(false);
    render(<ScoreTableTabs {...makeProps()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.some(b => b.querySelector('.anticon-file-excel'))).toBe(false);
    // Settings button is still present.
    expect(getSettingsButton()).toBeInTheDocument();
  });
});
