import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from 'antd';
import { DisciplineDto } from '@client/api';
import { DisciplineTable } from './DisciplineTable';

const disciplines: DisciplineDto[] = [
  { id: 1, name: 'Frontend' },
  { id: 2, name: 'Backend' },
];

function makeProps(overrides: Partial<Parameters<typeof DisciplineTable>[0]> = {}) {
  return {
    disciplines,
    handleUpdate: vi.fn(),
    handleDelete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as Parameters<typeof DisciplineTable>[0];
}

// Modal.confirm appends imperatively to document.body and is NOT torn down by RTL
// cleanup. Wait for any open/closing instance to leave the DOM after each test so
// the next test starts clean and dialog queries stay unique. NOTE: do NOT call
// Modal.destroyAll() in beforeEach — antd then double-mounts the next confirm.
async function awaitNoOpenDialog() {
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 3000 });
}

describe('<DisciplineTable />', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(async () => {
    // Only destroy when something is actually open — calling Modal.destroyAll()
    // on an empty body poisons antd's confirm holder (next confirm double-mounts).
    if (screen.queryByRole('dialog')) {
      Modal.destroyAll();
      await awaitNoOpenDialog();
    }
  });

  it('renders the column headers', () => {
    render(<DisciplineTable {...makeProps()} />);

    expect(screen.getByText('Discipline')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders a row per discipline', () => {
    render(<DisciplineTable {...makeProps()} />);

    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('renders edit and delete buttons for every row', () => {
    render(<DisciplineTable {...makeProps()} />);

    // Each row has two action buttons (edit + delete) → 2 rows = 4 buttons.
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('button')).toHaveLength(4);
  });

  it('calls handleUpdate with the clicked record when its edit button is pressed', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<DisciplineTable {...props} />);

    // The first action button of the first row is "edit".
    const [firstEditBtn] = within(screen.getByRole('table')).getAllByRole('button');
    await user.click(firstEditBtn!);

    expect(props.handleUpdate).toHaveBeenCalledWith(disciplines[0]);
  });

  it('opens a confirm dialog and calls handleDelete on confirm', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<DisciplineTable {...props} />);

    // Buttons render as [edit, delete] per row → index 1 is the first row's delete.
    const buttons = within(screen.getByRole('table')).getAllByRole('button');
    await user.click(buttons[1]!);

    // antd Modal.confirm renders into the document body. It echoes the title text in
    // both .ant-modal-title and .ant-modal-confirm-title, so match with getAllByText.
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getAllByText('Do you want to delete this discipline?').length).toBeGreaterThan(0);

    await user.click(within(dialog).getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(props.handleDelete).toHaveBeenCalledWith(disciplines[0]));
  });

  it('does not call handleDelete when the confirm dialog is cancelled', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<DisciplineTable {...props} />);

    const buttons = within(screen.getByRole('table')).getAllByRole('button');
    await user.click(buttons[1]!);

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));

    expect(props.handleDelete).not.toHaveBeenCalled();
  });

  it('renders an empty table without crashing when there are no disciplines', () => {
    render(<DisciplineTable {...makeProps({ disciplines: [] })} />);

    expect(screen.getByText('Discipline')).toBeInTheDocument();
    // antd renders its empty placeholder twice (sticky scroll body + main body).
    expect(screen.getAllByText(/no data/i).length).toBeGreaterThan(0);
    expect(within(screen.getByRole('table')).queryAllByRole('button')).toHaveLength(0);
  });
});
