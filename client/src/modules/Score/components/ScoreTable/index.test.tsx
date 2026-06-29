/* eslint-disable testing-library/no-node-access */
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from 'next/router';
import { ScoreTable, getTableWidth } from './index';

// --- Boundary mocks --------------------------------------------------------

// Generated CoursesTasksApi: returns the course tasks that become task columns.
const { getCourseTasks } = vi.hoisted(() => ({ getCourseTasks: vi.fn() }));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CoursesTasksApi: function CoursesTasksApi() {
    return { getCourseTasks };
  },
}));

// CourseService: getCourseScore (initial + on table change) and getStudentCourseScore
// (the summary row's "your score"). The instance is created with `new CourseService(id)`.
const { getCourseScore, getStudentCourseScore } = vi.hoisted(() => ({
  getCourseScore: vi.fn(),
  getStudentCourseScore: vi.fn(),
}));

vi.mock('@client/services/course', () => ({
  CourseService: function CourseService() {
    return { getCourseScore, getStudentCourseScore };
  },
}));

// useScorePaging returns [getPagedData]; ScoreTable calls it on pagination/filter/sort
// changes. Assert it receives the right pagination/filter/order arguments.
// `noPaging.value` lets a test make the hook return [undefined] (the !getPagedData guard).
const { getPagedData, noPaging } = vi.hoisted(() => ({ getPagedData: vi.fn(), noPaging: { value: false } }));

vi.mock('@client/modules/Score/hooks/useScorePaging', () => ({
  useScorePaging: () => [noPaging.value ? undefined : getPagedData],
}));

// useWindowDimensions drives the fixed-column logic; `windowWidth.value` controls it per test.
const { windowWidth } = vi.hoisted(() => ({ windowWidth: { value: 1200 } }));
vi.mock('@client/shared/hooks/useWindowDimensions', () => ({
  default: () => ({ width: windowWidth.value, height: 800 }),
}));

// --- Fixtures --------------------------------------------------------------

const courseTasks = [
  {
    id: 101,
    name: 'Task Alpha',
    studentEndDate: '2024-05-01T00:00:00.000Z',
    maxScore: 100,
    scoreWeight: 1,
    descriptionUrl: 'https://example.com/alpha',
  },
  {
    id: 202,
    name: 'Task Beta',
    studentEndDate: '2024-06-01T00:00:00.000Z',
    maxScore: 50,
    scoreWeight: 0.5,
    descriptionUrl: null,
  },
];

const makeStudent = (over: Partial<Record<string, unknown>> = {}) => ({
  name: 'Alice',
  githubId: 'alice',
  id: 1,
  active: true,
  isActive: true,
  cityName: 'Minsk',
  countryName: 'BY',
  totalScore: 90,
  rank: 1,
  crossCheckScore: 10,
  totalScoreChangeDate: '2024-04-01T00:00:00.000Z',
  mentor: { githubId: 'mentor1' },
  taskResults: [{ courseTaskId: 101, score: 80 }],
  contacts: {},
  ...over,
});

const twoStudents = [makeStudent(), makeStudent({ name: 'Bob', githubId: 'bob', id: 2, rank: 2, totalScore: 70 })];

const studentScore = makeStudent({ name: 'You', githubId: 'me', rank: 5, totalScore: 55 });

const page = (content: ReturnType<typeof makeStudent>[]) => ({
  content,
  pagination: { current: 1, pageSize: 100, total: content.length, totalPages: 1 },
});

// antd renders a fixed-column Table as TWO <table> elements (a fixed-left clone + the
// main scroll table), so every header/cell text appears twice. Scope assertions to the
// MAIN (last) table to count things once.
const mainTable = () => {
  const tables = screen.getAllByRole('table');
  return tables[tables.length - 1]!;
};

function makeProps(over: Partial<Parameters<typeof ScoreTable>[0]> = {}) {
  return {
    course: { id: 42, name: 'Test Course', completed: false },
    session: { githubId: 'me', isAdmin: true },
    onLoading: vi.fn(),
    activeOnly: true,
    isVisibleSetting: false,
    setIsVisibleSettings: vi.fn(),
    ...over,
  } as unknown as Parameters<typeof ScoreTable>[0];
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  noPaging.value = false;
  windowWidth.value = 1200;
  getCourseTasks.mockResolvedValue({ data: courseTasks });
  getCourseScore.mockResolvedValue(page(twoStudents));
  getStudentCourseScore.mockResolvedValue(studentScore);
  getPagedData.mockResolvedValue(page(twoStudents));
  vi.mocked(useRouter).mockReturnValue({
    query: {},
    push: vi.fn(),
    pathname: '/score',
    asPath: '/score',
  } as never);
});

describe('<ScoreTable />', () => {
  it('toggles the loading flag on and off around the initial data load', async () => {
    const onLoading = vi.fn();
    render(<ScoreTable {...makeProps({ onLoading })} />);

    await waitFor(() => expect(onLoading).toHaveBeenCalledWith(false));
    expect(onLoading).toHaveBeenCalledWith(true);
  });

  it('fetches course tasks, course score and the student score on mount', async () => {
    render(<ScoreTable {...makeProps()} />);

    await waitFor(() => expect(getCourseTasks).toHaveBeenCalledWith(42));
    expect(getStudentCourseScore).toHaveBeenCalledWith('me');
    // Initial course-score request carries activeOnly from the prop.
    expect(getCourseScore).toHaveBeenCalled();
    expect(getCourseScore.mock.calls[0][1]).toMatchObject({ activeOnly: true });
  });

  it('renders a row per student with the basic columns once loaded', async () => {
    render(<ScoreTable {...makeProps()} />);

    await screen.findAllByText('alice');
    const table = mainTable();
    expect(within(table).getByText('alice')).toBeInTheDocument();
    expect(within(table).getByText('bob')).toBeInTheDocument();
    // Task columns are derived from the fetched tasks.
    expect(within(table).getByText('Task Alpha')).toBeInTheDocument();
    expect(within(table).getByText('Task Beta')).toBeInTheDocument();
    // Pagination total footer.
    expect(screen.getByText(/total 2 students/i)).toBeInTheDocument();
  });

  it('renders the summary row (your score) when more than one student is present', async () => {
    render(<ScoreTable {...makeProps()} />);

    // studentScore.totalScore (55) is rendered in the summary row.
    await screen.findAllByText('alice');
    expect(screen.getAllByText('55').length).toBeGreaterThan(0);
  });

  it('does not render a summary row when only one student is present', async () => {
    getCourseScore.mockResolvedValue(page([twoStudents[0]!]));
    render(<ScoreTable {...makeProps()} />);

    await screen.findAllByText('alice');
    // The summary's distinctive "55" total would only appear via the summary row.
    expect(screen.queryByText('55')).not.toBeInTheDocument();
  });

  it('renders an empty table when the course has no students', async () => {
    getCourseScore.mockResolvedValue(page([]));
    render(<ScoreTable {...makeProps()} />);

    await waitFor(() => expect(getCourseScore).toHaveBeenCalled());
    expect((await screen.findAllByText(/no data/i)).length).toBeGreaterThan(0);
    expect(screen.queryByText('alice')).not.toBeInTheDocument();
  });

  it('requests the last page when the saved current page exceeds the available pages', async () => {
    // First response says current(1) > totalPages(0) → component refetches the last page.
    getCourseScore.mockResolvedValueOnce({
      content: twoStudents,
      pagination: { current: 1, pageSize: 100, total: 2, totalPages: 0 },
    });
    getCourseScore.mockResolvedValueOnce(page(twoStudents));

    render(<ScoreTable {...makeProps()} />);

    await waitFor(() => expect(getCourseScore).toHaveBeenCalledTimes(2));
    // The refetch pins current to totalPages (0 here).
    expect(getCourseScore.mock.calls[1][0]).toMatchObject({ current: 0 });
  });

  it('calls the paging hook with the requested page on pagination change', async () => {
    getCourseScore.mockResolvedValue({
      content: twoStudents,
      pagination: { current: 1, pageSize: 1, total: 2, totalPages: 2 },
    });
    render(<ScoreTable {...makeProps()} />);

    await screen.findAllByText('alice');

    // Go to page 2 via the pagination control (antd renders each page as <li title="N">).
    fireEvent.click(screen.getByTitle('2').querySelector('a')!);

    await waitFor(() => expect(getPagedData).toHaveBeenCalled());
    const [pagination] = getPagedData.mock.calls.at(-1)!;
    expect(pagination).toMatchObject({ current: 2 });
    // The student-score is refreshed alongside the page change.
    expect(getStudentCourseScore).toHaveBeenCalledTimes(2);
  });

  it('applies a column search filter through the paging hook with the typed value', async () => {
    const user = userEvent.setup();
    render(<ScoreTable {...makeProps()} />);

    await screen.findAllByText('alice');

    // Open the GitHub column's search filter (the header's search-icon trigger) and submit
    // a query. The dropdown's Input has placeholder "Search githubId".
    const githubHeader = screen.getAllByText('GitHub')[0]!.closest('th')!;
    const filterTrigger = githubHeader.querySelector('.ant-table-filter-trigger') as HTMLElement;
    await user.click(filterTrigger);

    const searchInput = await screen.findByPlaceholderText(/search githubId/i);
    await user.type(searchInput, 'alice');
    fireEvent.keyDown(searchInput, { key: 'Enter', keyCode: 13 });

    await waitFor(() => expect(getPagedData).toHaveBeenCalled());
    const [, filters] = getPagedData.mock.calls.at(-1)!;
    expect(filters.githubId).toEqual(['alice']);
  });

  it('triggers a sorted request through the paging hook when a column header is clicked', async () => {
    render(<ScoreTable {...makeProps()} />);

    await screen.findAllByText('alice');

    // Click the "Total" sortable column header to sort (antd fires onChange with action
    // 'sort' → the component re-requests data through the paging hook). With a fixed table
    // headers live in a separate <table>; pick the "Total" whose <th> is the sortable one.
    const totalHeader = screen
      .getAllByText('Total')
      .map(el => el.closest('th'))
      .find(th => th?.classList.contains('ant-table-column-has-sorters'))!;
    fireEvent.click(totalHeader);

    await waitFor(() => expect(getPagedData).toHaveBeenCalled());
  });

  it('saves hidden columns to localStorage and closes the drawer when settings are saved', async () => {
    const user = userEvent.setup();
    const setIsVisibleSettings = vi.fn();
    render(<ScoreTable {...makeProps({ isVisibleSetting: true, setIsVisibleSettings })} />);

    // Drawer is open (isVisibleSetting=true); expand the collapse to reach the task checkboxes.
    await user.click(await screen.findByText('Columns visibility'));

    // Uncheck "Task Alpha" then Save.
    await user.click(await screen.findByRole('checkbox', { name: 'Task Alpha' }));
    await user.click(screen.getByText('Save'));

    await waitFor(() => expect(setIsVisibleSettings).toHaveBeenCalled());
    // The hidden task id is persisted to localStorage under "notVisibleColumns".
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('notVisibleColumns') ?? '[]')).toContain('101');
    });
  });

  it('closes the settings drawer without saving when cancelled', async () => {
    const user = userEvent.setup();
    const setIsVisibleSettings = vi.fn();
    render(<ScoreTable {...makeProps({ isVisibleSetting: true, setIsVisibleSettings })} />);

    // The drawer's X close button cancels.
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /close/i }));

    expect(setIsVisibleSettings).toHaveBeenCalled();
    expect(localStorage.getItem('notVisibleColumns')).toBeNull();
  });

  it('seeds filters from router query params on initial load', async () => {
    vi.mocked(useRouter).mockReturnValue({
      query: { cityName: 'Minsk', githubId: 'alice', name: 'Alice', ['mentor.githubId']: 'mentor1' },
      push: vi.fn(),
      pathname: '/score',
    } as never);

    render(<ScoreTable {...makeProps()} />);

    await waitFor(() => expect(getCourseScore).toHaveBeenCalled());
    const [, filters] = getCourseScore.mock.calls[0]!;
    expect(filters).toMatchObject({
      activeOnly: true,
      cityName: 'Minsk',
      githubId: 'alice',
      name: 'Alice',
      ['mentor.githubId']: 'mentor1',
    });
  });

  it('keeps a task without a student end date when the course is completed', async () => {
    // task.studentEndDate null + course.completed → `!!studentEndDate || course.completed` keeps it.
    getCourseTasks.mockResolvedValue({
      data: [{ id: 303, name: 'No-Deadline Task', studentEndDate: null, maxScore: 10, scoreWeight: 1 }],
    });
    render(<ScoreTable {...makeProps({ course: { id: 42, name: 'C', completed: true } as never })} />);

    await screen.findAllByText('alice');
    expect(within(mainTable()).getByText('No-Deadline Task')).toBeInTheDocument();
  });

  it('marks inactive students with the disabled row class', async () => {
    getCourseScore.mockResolvedValue(page([makeStudent({ name: 'Inactive', githubId: 'ghost', isActive: false })]));
    render(<ScoreTable {...makeProps()} />);

    await screen.findAllByText('ghost');
    // rowClassName returns 'rs-table-row-disabled' for inactive rows.
    expect(document.querySelector('.rs-table-row-disabled')).toBeInTheDocument();
  });

  it('unfixes the GitHub column on narrow viewports', async () => {
    windowWidth.value = 320; // < 400 → setFixedColumn(false) → githubColumn.fixed = false.
    render(<ScoreTable {...makeProps()} />);

    await screen.findAllByText('alice');
    // The render completes without a fixed-left GitHub column (no crash); rows still present.
    expect(within(mainTable()).getByText('alice')).toBeInTheDocument();
  });

  it('selects a row when the row is clicked', async () => {
    render(<ScoreTable {...makeProps()} />);

    await screen.findAllByText('alice');
    const row = within(mainTable()).getByText('alice').closest('tr')!;
    fireEvent.click(row);

    // onRow's onClick runs setState([githubId]); antd marks the row selected.
    await waitFor(() => expect(row).toHaveClass('ant-table-row-selected'));
  });

  it('does nothing on table change when the paging getter is unavailable', async () => {
    noPaging.value = true; // useScorePaging returns [undefined] → getCourseScore early-returns.
    getCourseScore.mockResolvedValue({
      content: twoStudents,
      pagination: { current: 1, pageSize: 1, total: 2, totalPages: 2 },
    });
    render(<ScoreTable {...makeProps()} />);

    await screen.findAllByText('alice');
    getPagedData.mockClear();

    // Trigger a pagination change → getCourseScore hits `if (!getPagedData) return`.
    fireEvent.click(screen.getByTitle('2').querySelector('a')!);

    await waitFor(() => expect(getStudentCourseScore).toHaveBeenCalledTimes(2));
    expect(getPagedData).not.toHaveBeenCalled();
  });
});

describe('getTableWidth', () => {
  it('multiplies the column count by the per-column width', () => {
    expect(getTableWidth(0)).toBe(0);
    expect(getTableWidth(10)).toBe(900);
  });
});
