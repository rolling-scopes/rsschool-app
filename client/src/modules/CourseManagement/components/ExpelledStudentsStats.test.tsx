/* eslint-disable testing-library/no-node-access */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpelledStudentsStats from './ExpelledStudentsStats';
import type { ExpelledStatsDto } from '@client/api';

// --- Boundary mock --------------------------------------------------------
// useExpelledStats wraps ahooks `useRequest` around the generated CourseStatsApi.
// Mock the hook itself (the data/async boundary) so we drive the component purely
// through its returned state; everything rendered (Table, Buttons, CSV export) is real.
const { useExpelledStats } = vi.hoisted(() => ({ useExpelledStats: vi.fn() }));

vi.mock('@client/modules/CourseManagement/hooks/useExpelledStats', () => ({
  useExpelledStats,
}));

type HookReturn = ReturnType<typeof import('@client/modules/CourseManagement/hooks/useExpelledStats').useExpelledStats>;

function makeHookState(overrides: Partial<HookReturn> = {}): HookReturn {
  return {
    data: undefined,
    error: undefined,
    loading: false,
    isDeleting: false,
    handleDelete: vi.fn(),
    ...overrides,
  } as HookReturn;
}

const rows: ExpelledStatsDto[] = [
  {
    id: 'row-1',
    course: { logo: 'jsRs', alias: 'js-2024', name: 'JS Course', fullName: 'JavaScript Course' },
    user: { githubId: 'student-one' },
    reasonForLeaving: ['lost_motivation', 'no_time'],
    otherComment: 'Some comment, with comma',
    submittedAt: '2024-01-15T10:00:00.000Z',
  } as unknown as ExpelledStatsDto,
  {
    id: 'row-2',
    course: { logo: 'unknownLogo', alias: 'react-2024', name: 'React Course', fullName: '' },
    user: { githubId: 'student-two' },
    reasonForLeaving: undefined,
    otherComment: 'Quote "here"',
    submittedAt: '2024-02-20T12:00:00.000Z',
  } as unknown as ExpelledStatsDto,
];

// A row with missing nested objects (no course/user) and null scalar fields exercises the
// CSV value-extraction null-guards (the array dataIndex path that resolves to undefined and
// the string dataIndex path that resolves to null).
const sparseRow = {
  id: 'row-3',
  course: { logo: 'jsRs', alias: 'sparse', name: '', fullName: '' },
  user: undefined,
  reasonForLeaving: undefined,
  otherComment: undefined,
  submittedAt: null,
} as unknown as ExpelledStatsDto;

describe('<ExpelledStudentsStats />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the failure paragraph when the hook reports an error', () => {
    useExpelledStats.mockReturnValue(makeHookState({ error: new Error('boom') }));

    render(<ExpelledStudentsStats courseId={1} />);

    expect(screen.getByText('Failed to load statistics.')).toBeInTheDocument();
    expect(screen.queryByText('Detailed Statistics on Student Departures')).not.toBeInTheDocument();
  });

  it('renders the heading, export button and data rows', () => {
    useExpelledStats.mockReturnValue(makeHookState({ data: rows }));

    render(<ExpelledStudentsStats courseId={1} />);

    expect(screen.getByText('Detailed Statistics on Student Departures')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();

    // Course alias + github link rendered per row
    expect(screen.getByText('js-2024')).toBeInTheDocument();
    expect(screen.getByText('react-2024')).toBeInTheDocument();
    const ghLink = screen.getByRole('link', { name: 'student-one' });
    expect(ghLink).toHaveAttribute('href', 'https://github.com/student-one');

    // Reasons rendered as tags with underscores replaced by spaces
    expect(screen.getByText('lost motivation')).toBeInTheDocument();
    expect(screen.getByText('no time')).toBeInTheDocument();

    // fullName preferred, falls back to name when empty
    expect(screen.getByText('JavaScript Course')).toBeInTheDocument();
    expect(screen.getByText('React Course')).toBeInTheDocument();
  });

  it('calls handleDelete with the row id when a Delete button is clicked', async () => {
    const handleDelete = vi.fn();
    useExpelledStats.mockReturnValue(makeHookState({ data: rows, handleDelete }));
    const user = userEvent.setup();

    render(<ExpelledStudentsStats courseId={1} />);

    const firstRow = screen.getByText('js-2024').closest('tr')!;
    await user.click(within(firstRow).getByRole('button', { name: /delete/i }));

    expect(handleDelete).toHaveBeenCalledWith('row-1');
  });

  it('exports a CSV with headers and escaped values when Export CSV is clicked', async () => {
    // Include a sparse row so the CSV value extraction hits the null/undefined guards.
    useExpelledStats.mockReturnValue(makeHookState({ data: [...rows, sparseRow] }));
    const user = userEvent.setup();

    // Capture the blob contents and the programmatic download click.
    let capturedBlob: Blob | null = null;
    const createObjectURL = vi.fn((blob: Blob) => {
      // Stash the blob so we can read its text after the export completes.
      capturedBlob = blob;
      return 'blob:mock-url';
    });
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<ExpelledStudentsStats courseId={1} />);
    await user.click(screen.getByRole('button', { name: /export csv/i }));

    await waitFor(() => expect(clickSpy).toHaveBeenCalled());
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    // Decode the generated CSV from the blob.
    const capturedCsv = await capturedBlob!.text();
    const lines = capturedCsv.split('\n');
    // Header row built from exportable (dataIndex) columns.
    expect(lines[0]).toContain('Course');
    expect(lines[0]).toContain('Student GitHub');
    expect(lines[0]).toContain('Reasons for Leaving');
    // Exportable columns read via their dataIndex paths: course.name + user.githubId.
    expect(capturedCsv).toContain('JS Course');
    expect(capturedCsv).toContain('student-one');
    // reasonForLeaving is stringified as an array (contains a comma → gets quoted).
    expect(capturedCsv).toContain('"lost_motivation,no_time"');
    // A comma-containing comment is wrapped in quotes.
    expect(capturedCsv).toContain('"Some comment, with comma"');
    // A value containing a quote gets its quotes doubled and is wrapped.
    expect(capturedCsv).toContain('"Quote ""here"""');

    clickSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('does not export when there is no data', async () => {
    useExpelledStats.mockReturnValue(makeHookState({ data: [] }));
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => 'blob:none');
    vi.stubGlobal('URL', { ...URL, createObjectURL });

    render(<ExpelledStudentsStats courseId={1} />);
    await user.click(screen.getByRole('button', { name: /export csv/i }));

    expect(createObjectURL).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
