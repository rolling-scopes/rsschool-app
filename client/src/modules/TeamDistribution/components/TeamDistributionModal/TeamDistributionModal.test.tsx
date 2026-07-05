import { screen, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { TeamDistributionApi, TeamDistributionDto } from '@client/api';
import TeamDistributionModal from './TeamDistributionModal';

vi.mock('@client/api');

// DatePicker.RangePicker is a brittle widget in jsdom — stub it with a button that
// emits a fixed [start, end] dayjs range through the onChange that Form.Item injects.
vi.mock('antd', async () => {
  const antd = await vi.importActual<typeof import('antd')>('antd');
  const RangePicker = (props: { onChange?: (range: [dayjs.Dayjs, dayjs.Dayjs]) => void }) => (
    <button
      type="button"
      data-testid="range-picker"
      onClick={() => props.onChange?.([dayjs.utc('2024-05-01T00:00:00Z'), dayjs.utc('2024-05-31T23:59:00Z')])}
    >
      pick range
    </button>
  );
  const DatePicker = Object.assign((props: unknown) => <antd.DatePicker {...(props as object)} />, {
    ...antd.DatePicker,
    RangePicker,
  });
  return { ...antd, DatePicker };
});

const updateTeamDistribution = vi.mocked(TeamDistributionApi.prototype.updateTeamDistribution);
const createTeamDistribution = vi.mocked(TeamDistributionApi.prototype.createTeamDistribution);

function renderModal(overrides: Partial<Parameters<typeof TeamDistributionModal>[0]> = {}) {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onCancel = vi.fn();
  render(<TeamDistributionModal onSubmit={onSubmit} onCancel={onCancel} courseId={42} {...overrides} />);
  return { onSubmit, onCancel };
}

describe('<TeamDistributionModal />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTeamDistribution.mockResolvedValue({} as never);
    updateTeamDistribution.mockResolvedValue({} as never);
  });

  it('renders the create copy when no data is provided', () => {
    renderModal();
    expect(screen.getByText(/you are creating a group distribution event/i)).toBeInTheDocument();
  });

  it('renders the edit copy and pre-fills the name when editing', () => {
    const data = { id: 9, name: 'Existing Event', description: 'desc' } as TeamDistributionDto;
    renderModal({ data });
    expect(screen.getByText(/you are editing a group distribution event/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Existing Event');
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal();
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('blocks submit and shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /^ok$/i }));

    expect(await screen.findByText('Please enter event name')).toBeInTheDocument();
    expect(screen.getByText('Please enter start and end date')).toBeInTheDocument();
    expect(createTeamDistribution).not.toHaveBeenCalled();
  });

  it('rejects an invalid description URL', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByLabelText('Description Url'), 'not-a-url');
    await user.click(screen.getByRole('button', { name: /^ok$/i }));

    expect(await screen.findByText('Please enter valid URL')).toBeInTheDocument();
    expect(createTeamDistribution).not.toHaveBeenCalled();
  });

  it('creates a new distribution with the mapped payload when no id is present', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.type(screen.getByLabelText('Name'), 'New Distribution');
    await user.click(screen.getByTestId('range-picker'));
    await user.click(screen.getByRole('button', { name: /^ok$/i }));

    await waitFor(() => expect(createTeamDistribution).toHaveBeenCalledTimes(1));
    const [courseId, record] = createTeamDistribution.mock.calls[0];
    expect(courseId).toBe(42);
    expect(record).toMatchObject({
      name: 'New Distribution',
      strictTeamSize: 3,
      minTotalScore: 0,
      startDate: expect.stringContaining('2024-05-01'),
      endDate: expect.stringContaining('2024-05-31'),
    });
    expect(updateTeamDistribution).not.toHaveBeenCalled();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it('updates an existing distribution when an id is present', async () => {
    const user = userEvent.setup();
    const data = {
      id: 9,
      name: 'Existing Event',
      description: 'desc',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-31T00:00:00Z',
      strictTeamSize: 4,
    } as TeamDistributionDto;
    const { onSubmit } = renderModal({ data });

    await user.click(screen.getByRole('button', { name: /^ok$/i }));

    await waitFor(() => expect(updateTeamDistribution).toHaveBeenCalledTimes(1));
    const [courseId, id, record] = updateTeamDistribution.mock.calls[0];
    expect(courseId).toBe(42);
    expect(id).toBe(9);
    expect(record).toMatchObject({ name: 'Existing Event', strictTeamSize: 4 });
    expect(createTeamDistribution).not.toHaveBeenCalled();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });
});
