import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import type { Session } from '@client/components/withSession';
import { CountryDto, HeroesRadarDto } from '@client/api';
import { SessionContext } from '@client/modules/Course/contexts';
import HeroesRadarTab from './HeroesRadarTab';

const { useActiveCourseContext } = vi.hoisted(() => ({ useActiveCourseContext: vi.fn() }));

// Real-ish session context (created from the actual React in the factory) so we
// can flip isAdmin per test.
vi.mock('@client/modules/Course/contexts', async () => {
  const { createContext } = await vi.importActual<typeof import('react')>('react');
  return {
    SessionContext: createContext({ isAdmin: false }),
    useActiveCourseContext,
  };
});

// DatePicker/RangePicker is a brittle widget — stub it but let it push a date
// range through the Form.Item-provided onChange so the date-formatting branches
// run.
vi.mock('antd', async () => {
  const antd = await vi.importActual<typeof import('antd')>('antd');
  const RangePicker = ({ onChange }: { onChange?: (dates: unknown) => void }) => (
    <button
      type="button"
      data-testid="range-picker"
      onClick={() => onChange?.([dayjs('2023-01-01'), dayjs('2023-01-31')])}
    >
      set-dates
    </button>
  );
  return {
    ...antd,
    DatePicker: Object.assign(() => <div data-testid="date-picker" />, { RangePicker }),
  };
});

// Focus on the Tab's logic; stub the heavy table child but surface its onChange
// so pagination handling can be exercised.
vi.mock('./HeroesRadarTable', () => ({
  default: ({
    heroes,
    onChange,
  }: {
    heroes: HeroesRadarDto;
    onChange: (p: { current: number; pageSize: number }) => void;
  }) => (
    <div data-testid="radar-table">
      rows:{heroes.content.length}
      <button type="button" onClick={() => onChange({ current: 2, pageSize: 20 })}>
        change-page
      </button>
    </div>
  ),
}));

const { getHeroesRadar, getHeroesCountries } = vi.hoisted(() => ({
  getHeroesRadar: vi.fn(),
  getHeroesCountries: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  GratitudesApi: function GratitudesApi() {
    return { getHeroesRadar, getHeroesCountries };
  },
}));

const heroesResponse: HeroesRadarDto = {
  content: [
    {
      githubId: 'alice',
      name: 'Alice',
      rank: 1,
      total: 3,
      badges: [],
    },
  ],
  pagination: { current: 1, pageSize: 20, itemCount: 1, total: 1, totalPages: 1 },
};

const countries: CountryDto[] = [{ countryName: 'Poland', count: 5 } as unknown as CountryDto];

function renderTab({ isAdmin = false, setLoading = vi.fn() } = {}) {
  return render(
    <SessionContext.Provider value={{ isAdmin } as Session}>
      <HeroesRadarTab setLoading={setLoading} />
    </SessionContext.Provider>,
  );
}

describe('HeroesRadarTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getHeroesRadar.mockResolvedValue({ data: heroesResponse });
    getHeroesCountries.mockResolvedValue({ data: countries });
    useActiveCourseContext.mockReturnValue({
      courses: [
        { id: 1, name: 'RS 2024' },
        { id: 2, name: 'RS 2023' },
      ],
    });
  });

  it('fetches the heroes radar on mount with the initial query params', async () => {
    renderTab();

    await waitFor(() => expect(getHeroesRadar).toHaveBeenCalled());
    expect(getHeroesRadar).toHaveBeenCalledWith(1, 20, undefined, undefined, undefined, undefined, undefined);
    expect(await screen.findByTestId('radar-table')).toHaveTextContent('rows:1');
  });

  it('toggles the loading flag around the fetch', async () => {
    const setLoading = vi.fn();
    renderTab({ setLoading });

    await waitFor(() => expect(getHeroesRadar).toHaveBeenCalled());
    expect(setLoading).toHaveBeenCalledWith(true);
    await waitFor(() => expect(setLoading).toHaveBeenCalledWith(false));
  });

  it('does not load countries, country filter or export for non-admins', async () => {
    renderTab({ isAdmin: false });

    await waitFor(() => expect(getHeroesRadar).toHaveBeenCalled());
    expect(getHeroesCountries).not.toHaveBeenCalled();
    expect(screen.queryByText('Countries')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Export CSV/ })).not.toBeInTheDocument();
  });

  it('loads countries and shows admin-only controls for admins', async () => {
    renderTab({ isAdmin: true });

    await waitFor(() => expect(getHeroesCountries).toHaveBeenCalled());
    expect(screen.getByText('Countries')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export CSV/ })).toBeInTheDocument();
  });

  it('renders the course filter options', async () => {
    renderTab();
    await waitFor(() => expect(getHeroesRadar).toHaveBeenCalled());

    fireEvent.mouseDown(screen.getByText('Select course'));
    expect(await screen.findByTitle('RS 2024')).toBeInTheDocument();
    expect(screen.getByTitle('RS 2023')).toBeInTheDocument();
  });

  it('refetches with selected filters on Filter submit', async () => {
    const user = userEvent.setup();
    renderTab();
    await waitFor(() => expect(getHeroesRadar).toHaveBeenCalledTimes(1));

    fireEvent.mouseDown(screen.getByText('Select course'));
    fireEvent.click(await screen.findByTitle('RS 2024'));

    await user.click(screen.getByRole('button', { name: 'Filter' }));

    await waitFor(() => {
      expect(getHeroesRadar).toHaveBeenLastCalledWith(1, 20, 1, undefined, undefined, undefined, undefined);
    });
  });

  it('resets the form and refetches on Clear', async () => {
    const user = userEvent.setup();
    renderTab();
    await waitFor(() => expect(getHeroesRadar).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    await waitFor(() => expect(getHeroesRadar).toHaveBeenCalledTimes(2));
    expect(getHeroesRadar).toHaveBeenLastCalledWith(1, 20, undefined, undefined, undefined, undefined, undefined);
  });

  it('refetches the current page when the table pagination changes', async () => {
    const user = userEvent.setup();
    renderTab();
    await waitFor(() => expect(getHeroesRadar).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: 'change-page' }));

    await waitFor(() => {
      expect(getHeroesRadar).toHaveBeenLastCalledWith(2, 20, undefined, undefined, undefined, undefined, undefined);
    });
  });

  it('formats and forwards the selected date range when filtering', async () => {
    const user = userEvent.setup();
    renderTab();
    await waitFor(() => expect(getHeroesRadar).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: 'set-dates' }));
    await user.click(screen.getByRole('button', { name: 'Filter' }));

    await waitFor(() => {
      expect(getHeroesRadar).toHaveBeenLastCalledWith(
        1,
        20,
        undefined,
        undefined,
        undefined,
        '2023-01-01',
        '2023-01-31',
      );
    });
  });

  it('includes the date range params in the csv export url', async () => {
    const user = userEvent.setup();
    const original = window.location.href;
    Object.defineProperty(window, 'location', { writable: true, value: { href: original } });

    renderTab({ isAdmin: true });
    await waitFor(() => expect(getHeroesRadar).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: 'set-dates' }));
    await user.click(screen.getByRole('button', { name: 'Filter' }));
    await waitFor(() => expect(getHeroesRadar).toHaveBeenCalledTimes(2));

    await user.click(screen.getByRole('button', { name: /Export CSV/ }));

    expect(window.location.href).toContain('startDate=2023-01-01');
    expect(window.location.href).toContain('endDate=2023-01-31');
  });

  it('exports to csv by navigating to the csv endpoint', async () => {
    const user = userEvent.setup();
    const original = window.location.href;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: original },
    });

    renderTab({ isAdmin: true });
    await waitFor(() => expect(getHeroesRadar).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: /Export CSV/ }));

    expect(window.location.href).toContain('/api/v2/gratitudes/heroes/radar/csv?');
    expect(window.location.href).toContain('pageSize=1');
  });
});
