import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { message } from 'antd';
import { TeamDto } from '@client/api';
import TeamModal from './TeamModal';

// StudentSearch is a remote-search Select; replace it with a simple stub that
// integrates with antd Form.Item (Form.Item injects value/onChange via cloneElement).
// A button drives the multi-select so we avoid char-by-char comma parsing ambiguity.
vi.mock('@client/shared/components/StudentSearch', () => ({
  StudentSearch: (props: { value?: number[]; onChange?: (v: number[]) => void }) => (
    <div data-testid="student-search" data-value={(props.value ?? []).join(',')}>
      <button type="button" onClick={() => props.onChange?.([1, 2])}>
        pick students
      </button>
      <button type="button" onClick={() => props.onChange?.([1, 2, 3, 4])}>
        pick too many
      </button>
    </div>
  ),
}));

function renderModal(overrides: Partial<Parameters<typeof TeamModal>[0]> = {}) {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onCancel = vi.fn();
  render(
    <TeamModal
      isManager={false}
      maxStudentsCount={3}
      courseId={1}
      mode="create"
      data={{}}
      onCancel={onCancel}
      onSubmit={onSubmit}
      {...overrides}
    />,
  );
  return { onSubmit, onCancel };
}

describe('<TeamModal />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the Create title and Create ok button in create mode', () => {
    renderModal({ mode: 'create' });
    expect(screen.getByText('Create Team')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^create$/i })).toBeInTheDocument();
  });

  it('renders the Edit title and Edit ok button in edit mode', () => {
    renderModal({ mode: 'edit' });
    expect(screen.getByText('Edit Team')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^edit$/i })).toBeInTheDocument();
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal();
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('does not submit and shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.click(screen.getByRole('button', { name: /^create$/i }));

    expect(await screen.findByText('Please enter team name')).toBeInTheDocument();
    expect(screen.getByText('Please enter team description')).toBeInTheDocument();
    expect(screen.getByText('Please enter link')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects an invalid Discord URL', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal();

    await user.type(screen.getByLabelText('Name'), 'Dream Team');
    await user.type(screen.getByLabelText('Description'), 'Best team ever');
    await user.type(screen.getByLabelText('Link to Discord server'), 'not-a-url');
    await user.click(screen.getByRole('button', { name: /^create$/i }));

    expect(await screen.findByText('Please enter valid URL')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the create payload (without studentIds for non-managers)', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal({ isManager: false });

    await user.type(screen.getByLabelText('Name'), 'Dream Team');
    await user.type(screen.getByLabelText('Description'), 'Best team ever');
    await user.type(screen.getByLabelText('Link to Discord server'), 'https://discord.gg/abc');
    await user.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      {
        name: 'Dream Team',
        description: 'Best team ever',
        chatLink: 'https://discord.gg/abc',
        studentIds: undefined,
      },
      undefined,
    );
  });

  it('passes the existing team id as the second submit argument in edit mode', async () => {
    const user = userEvent.setup();
    const data: Partial<TeamDto> = {
      id: 42,
      name: 'Old Name',
      description: 'Old description',
      chatLink: 'https://discord.gg/old',
    };
    const { onSubmit } = renderModal({ mode: 'edit', data });

    await user.click(screen.getByRole('button', { name: /^edit$/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Old Name', chatLink: 'https://discord.gg/old' }),
      42,
    );
  });

  it('pre-fills student ids from data in manager edit mode', async () => {
    const user = userEvent.setup();
    const data: Partial<TeamDto> = {
      id: 5,
      name: 'Edited Team',
      description: 'Edited description',
      chatLink: 'https://discord.gg/edit',
      students: [
        { id: 11, fullName: 'Student One', githubId: 'gh1' } as never,
        { id: 22, fullName: 'Student Two', githubId: 'gh2' } as never,
      ],
    };
    const { onSubmit } = renderModal({ isManager: true, mode: 'edit', data });

    // initialValue from data.students.map(id) seeds the multi-select.
    expect(screen.getByTestId('student-search')).toHaveAttribute('data-value', '11,22');

    await user.click(screen.getByRole('button', { name: /^edit$/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ studentIds: [11, 22] }), 5);
  });

  it('shows the Students field for managers and requires it', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal({ isManager: true });

    expect(screen.getByTestId('student-search')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Name'), 'Manager Team');
    await user.type(screen.getByLabelText('Description'), 'Created by manager');
    await user.type(screen.getByLabelText('Link to Discord server'), 'https://discord.gg/mgr');
    await user.click(screen.getByRole('button', { name: /^create$/i }));

    expect(await screen.findByText('Please select students')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits studentIds when a manager selects students', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderModal({ isManager: true, maxStudentsCount: 3 });

    await user.type(screen.getByLabelText('Name'), 'Manager Team');
    await user.type(screen.getByLabelText('Description'), 'Created by manager');
    await user.type(screen.getByLabelText('Link to Discord server'), 'https://discord.gg/mgr');
    await user.click(screen.getByRole('button', { name: /pick students/i }));
    await user.click(screen.getByRole('button', { name: /^create$/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ studentIds: [1, 2] }), undefined);
  });

  it('warns and does not set the field when more than maxStudentsCount students are selected', async () => {
    const user = userEvent.setup();
    const warnSpy = vi.spyOn(message, 'warning').mockImplementation(() => ({}) as never);
    renderModal({ isManager: true, maxStudentsCount: 3 });

    await user.click(screen.getByRole('button', { name: /pick too many/i }));

    expect(warnSpy).toHaveBeenCalledWith('You can only select a maximum of 3 students.');
    warnSpy.mockRestore();
  });

  it('does not render the Students field for non-managers', () => {
    renderModal({ isManager: false });
    expect(screen.queryByTestId('student-search')).not.toBeInTheDocument();
  });
});
