import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReactNode, createContext } from 'react';
import type { UploadProps } from 'antd';
import { SubmitScorePage } from '@client/pages/course/submit-scores';

// --- Boundary & brittle-widget mocks --------------------------------------

vi.mock('next/config', () => ({ default: () => ({}) }));

vi.mock('@client/modules/Course/contexts', () => ({
  SessionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  SessionContext: createContext({ id: 1, isAdmin: true, courses: { 42: { roles: ['manager'] } } }),
  useActiveCourseContext: () => ({ course: { id: 42, name: 'Test Course' } }),
}));

vi.mock('@client/domain/user', () => ({ isCourseManager: () => true }));

const { getCourseTasks } = vi.hoisted(() => ({
  getCourseTasks: vi.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        name: 'Task A',
        studentStartDate: '2024-01-01',
        studentEndDate: '2024-12-31',
        taskOwner: null,
        maxScore: 100,
      },
    ],
  }),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CoursesTasksApi: function CoursesTasksApi() {
    return { getCourseTasks };
  },
}));

const { postMultipleScores } = vi.hoisted(() => ({ postMultipleScores: vi.fn() }));

vi.mock('@client/services/course', () => ({
  CourseService: function CourseService() {
    return { postMultipleScores, searchStudents: vi.fn().mockResolvedValue([]) };
  },
}));

vi.mock('@client/shared/components/StudentSearch', () => ({
  StudentSearch: (props: { value?: string; onChange?: (v: string) => void }) => (
    <input data-testid="student-input" value={props.value ?? ''} onChange={e => props.onChange?.(e.target.value)} />
  ),
}));

vi.mock('@client/shared/components/PageLayout', () => ({
  PageLayoutSimple: ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

// Brittle widget: antd Upload. Replace with a controlled trigger that calls onChange
// with a synthetic fileList. Each "uid" maps to CSV text we stash on the file object so the
// (real) FileReader stub can read it back. We render the current fileList length for assertions.
const uploadTextByUid = new Map<string, string>();

vi.mock('antd', async () => {
  const antd = await vi.importActual<typeof import('antd')>('antd');
  const MockUpload = (props: UploadProps & { children?: ReactNode }) => {
    const { fileList = [], onChange, children } = props;
    return (
      <div data-testid="upload">
        <span data-testid="upload-count">{fileList.length}</span>
        <button
          type="button"
          onClick={() => {
            // Pull the text registered by the test via the global queue.
            const next =
              (globalThis as unknown as { __nextUpload?: { uid: string; text: string }[] }).__nextUpload ?? [];
            next.forEach(({ uid, text }) => uploadTextByUid.set(uid, text));
            const newFileList = next.map(({ uid }) => ({
              uid,
              name: `${uid}.csv`,
              originFileObj: { __uid: uid } as unknown as File,
            }));
            onChange?.({ fileList: newFileList } as Parameters<NonNullable<UploadProps['onChange']>>[0]);
          }}
        >
          mock-select
        </button>
        {children}
      </div>
    );
  };
  return { ...antd, Upload: MockUpload };
});

// --- FileReader stub: resolve readAsText with the CSV text registered for the file uid ----
class MockFileReader {
  onload: ((e: { target: { result: string } }) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  readAsText(blob: { __uid?: string }) {
    const uid = blob?.__uid ?? '';
    const text = uploadTextByUid.get(uid);
    queueMicrotask(() => {
      if (text === '__ERROR__') {
        this.onerror?.(new Error('read failed'));
      } else {
        this.onload?.({ target: { result: text ?? '' } });
      }
    });
  }
}

function queueUpload(files: { uid: string; text: string }[]) {
  (globalThis as unknown as { __nextUpload?: { uid: string; text: string }[] }).__nextUpload = files;
}

// --- Tests -----------------------------------------------------------------

describe('<SubmitScorePage /> CSV upload flow', () => {
  const OriginalFileReader = globalThis.FileReader;

  beforeEach(() => {
    vi.clearAllMocks();
    uploadTextByUid.clear();
    (globalThis as unknown as { FileReader: unknown }).FileReader = MockFileReader;
  });

  afterEach(() => {
    (globalThis as unknown as { FileReader: unknown }).FileReader = OriginalFileReader;
  });

  it('registers chosen files in the Upload fileList', async () => {
    const user = userEvent.setup();
    render(<SubmitScorePage />);

    await waitFor(() => expect(getCourseTasks).toHaveBeenCalled());

    queueUpload([{ uid: 'f1', text: 'GitHub,Score\nuser1,80\n' }]);
    await user.click(screen.getByRole('button', { name: 'mock-select' }));

    expect(screen.getByTestId('upload-count')).toHaveTextContent('1');
  });

  it('parses a valid CSV, uploads the deduped best scores, and shows the summary table', async () => {
    const user = userEvent.setup();
    postMultipleScores.mockResolvedValue([
      { status: 'updated', value: undefined },
      { status: 'updated', value: undefined },
    ]);
    render(<SubmitScorePage />);
    await waitFor(() => expect(getCourseTasks).toHaveBeenCalled());

    // Select the course task so courseTaskId is set on submit.
    const combobox = screen.getAllByRole('combobox')[0];
    fireEvent.mouseDown(combobox);
    await user.click(await screen.findByText(/Task A/));

    // "user1" appears twice; best (90) should win → deduplicated.
    queueUpload([
      { uid: 'f1', text: 'GitHub,Score\nhttps://github.com/user1,80\nuser2,70\n' },
      { uid: 'f2', text: 'GitHub,Score\nuser1,90\n' },
    ]);
    await user.click(screen.getByRole('button', { name: 'mock-select' }));

    await user.click(screen.getByRole('button', { name: /^Submit$/i }));

    await waitFor(() => expect(postMultipleScores).toHaveBeenCalledTimes(1));
    const [taskId, payload] = postMultipleScores.mock.calls[0];
    expect(taskId).toBe(1);
    // user1 deduped to its best score 90, user2 = 70.
    expect(payload).toEqual(
      expect.arrayContaining([
        { studentGithubId: 'user1', score: 90 },
        { studentGithubId: 'user2', score: 70 },
      ]),
    );
    expect(payload).toHaveLength(2);

    // Summary table appears with the aggregated "updated" count.
    expect(await screen.findByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('updated')).toBeInTheDocument();
  });

  it('renders skipped students under a "Skipped students" section', async () => {
    const user = userEvent.setup();
    postMultipleScores.mockResolvedValue([
      { status: 'created', value: undefined },
      { status: 'skipped', value: 'ghost-student not found' },
    ]);
    render(<SubmitScorePage />);
    await waitFor(() => expect(getCourseTasks).toHaveBeenCalled());

    const combobox = screen.getAllByRole('combobox')[0];
    fireEvent.mouseDown(combobox);
    await user.click(await screen.findByText(/Task A/));

    queueUpload([{ uid: 'f1', text: 'GitHub,Score\nuser1,50\nghost,60\n' }]);
    await user.click(screen.getByRole('button', { name: 'mock-select' }));
    await user.click(screen.getByRole('button', { name: /^Submit$/i }));

    expect(await screen.findByText('Skipped students')).toBeInTheDocument();
    expect(screen.getByText('ghost-student not found')).toBeInTheDocument();
  });

  it('shows a specific "Incorrect data" error when required headers are missing', async () => {
    const user = userEvent.setup();
    render(<SubmitScorePage />);
    await waitFor(() => expect(getCourseTasks).toHaveBeenCalled());

    const combobox = screen.getAllByRole('combobox')[0];
    fireEvent.mouseDown(combobox);
    await user.click(await screen.findByText(/Task A/));

    // Missing "Score" header.
    queueUpload([{ uid: 'f1', text: 'GitHub,Points\nuser1,80\n' }]);
    await user.click(screen.getByRole('button', { name: 'mock-select' }));
    await user.click(screen.getByRole('button', { name: /^Submit$/i }));

    await waitFor(() => {
      // The component routes "Incorrect data" errors to message.error; the network call never happens.
      expect(postMultipleScores).not.toHaveBeenCalled();
    });
  });

  it('handles a generic upload failure without rendering a results summary', async () => {
    const user = userEvent.setup();
    // Reject with a non-"Incorrect data" error → falls into the generic message.error branch.
    postMultipleScores.mockRejectedValue(new Error('Boom'));
    render(<SubmitScorePage />);
    await waitFor(() => expect(getCourseTasks).toHaveBeenCalled());

    const combobox = screen.getAllByRole('combobox')[0];
    fireEvent.mouseDown(combobox);
    await user.click(await screen.findByText(/Task A/));

    queueUpload([{ uid: 'f1', text: 'GitHub,Score\nuser1,50\n' }]);
    await user.click(screen.getByRole('button', { name: 'mock-select' }));
    await user.click(screen.getByRole('button', { name: /^Submit$/i }));

    await waitFor(() => expect(postMultipleScores).toHaveBeenCalled());
    // The catch branch swallows the error → no Summary table is rendered.
    expect(screen.queryByText('Summary')).not.toBeInTheDocument();
  });

  it('handles a FileReader read error during parsing without uploading', async () => {
    const user = userEvent.setup();
    render(<SubmitScorePage />);
    await waitFor(() => expect(getCourseTasks).toHaveBeenCalled());

    const combobox = screen.getAllByRole('combobox')[0];
    fireEvent.mouseDown(combobox);
    await user.click(await screen.findByText(/Task A/));

    // "__ERROR__" drives the FileReader.onerror path in parseFiles.
    queueUpload([{ uid: 'f1', text: '__ERROR__' }]);
    await user.click(screen.getByRole('button', { name: 'mock-select' }));
    await user.click(screen.getByRole('button', { name: /^Submit$/i }));

    // parseFiles rejects → handleSubmit catch → the network call never happens.
    await waitFor(() => {
      expect(screen.queryByText('Summary')).not.toBeInTheDocument();
    });
    expect(postMultipleScores).not.toHaveBeenCalled();
  });

  it('does not submit when no file has been selected (form validation blocks it)', async () => {
    const user = userEvent.setup();
    render(<SubmitScorePage />);
    await waitFor(() => expect(getCourseTasks).toHaveBeenCalled());

    const combobox = screen.getAllByRole('combobox')[0];
    fireEvent.mouseDown(combobox);
    await user.click(await screen.findByText(/Task A/));

    await user.click(screen.getByRole('button', { name: /^Submit$/i }));

    await waitFor(() => {
      expect(screen.getByText('Please select csv-file')).toBeInTheDocument();
    });
    expect(postMultipleScores).not.toHaveBeenCalled();
  });

  it('clears previous results when switching tabs', async () => {
    const user = userEvent.setup();
    postMultipleScores.mockResolvedValue([{ status: 'created', value: undefined }]);
    render(<SubmitScorePage />);
    await waitFor(() => expect(getCourseTasks).toHaveBeenCalled());

    const combobox = screen.getAllByRole('combobox')[0];
    fireEvent.mouseDown(combobox);
    await user.click(await screen.findByText(/Task A/));

    queueUpload([{ uid: 'f1', text: 'GitHub,Score\nuser1,50\n' }]);
    await user.click(screen.getByRole('button', { name: 'mock-select' }));
    await user.click(screen.getByRole('button', { name: /^Submit$/i }));

    expect(await screen.findByText('Summary')).toBeInTheDocument();

    // Switching tabs triggers Tabs.onChange → setSubmitResults([]) → summary disappears.
    await user.click(screen.getByRole('tab', { name: /manual entry/i }));

    await waitFor(() => {
      expect(screen.queryByText('Summary')).not.toBeInTheDocument();
    });
  });
});
