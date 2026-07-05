import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Form } from 'antd';
import { SettingsDrawer } from './index';

// CourseTaskDto has many required fields; the drawer only reads id/name/isVisible.
const courseTasks = [
  { id: 1, name: 'Task A', isVisible: true },
  { id: 2, name: 'Task B', isVisible: false },
  { id: 3, name: 'Task C', isVisible: true },
] as never;

function makeProps(overrides: Partial<Parameters<typeof SettingsDrawer>[0]> = {}) {
  return {
    courseTasks,
    isVisible: true,
    onOk: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  } as Parameters<typeof SettingsDrawer>[0];
}

// The drawer body wraps the form + action buttons in a collapsed antd Collapse panel
// ("Columns visibility"). Expand it so the checkboxes and action buttons mount/become
// interactive, then return the dialog body for scoped queries.
async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText('Columns visibility'));
  // Action buttons live below the checkboxes once expanded.
  await screen.findByText('Save');
}

describe('<SettingsDrawer />', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not render the drawer body when isVisible is false', () => {
    render(<SettingsDrawer {...makeProps({ isVisible: false })} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the drawer title and the collapsible "Columns visibility" section', () => {
    render(<SettingsDrawer {...makeProps()} />);

    expect(screen.getByText('Score settings')).toBeInTheDocument();
    expect(screen.getByText('Columns visibility')).toBeInTheDocument();
  });

  it('renders a checkbox per course task seeded from isVisible once expanded', async () => {
    const user = userEvent.setup();
    render(<SettingsDrawer {...makeProps()} />);

    await openPanel(user);

    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
    expect(screen.getByText('Task C')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    // Initial values mirror `isVisible`.
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });

  it('calls onCancel when the Cancel action is clicked', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<SettingsDrawer {...props} />);

    await openPanel(user);
    await user.click(screen.getByText('Cancel'));

    expect(props.onCancel).toHaveBeenCalledTimes(1);
    expect(props.onOk).not.toHaveBeenCalled();
  });

  it('toggles a checkbox and saves the current field map via onOk', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<SettingsDrawer {...props} />);

    await openPanel(user);

    // Uncheck Task A (was visible) → now hidden.
    await user.click(screen.getByRole('checkbox', { name: 'Task A' }));
    await user.click(screen.getByText('Save'));

    await waitFor(() => expect(props.onOk).toHaveBeenCalledTimes(1));
    // onOk gets the form's value map keyed by task id.
    expect(props.onOk).toHaveBeenCalledWith({ 1: false, 2: false, 3: true });
  });

  it('"All" checks every checkbox', async () => {
    const user = userEvent.setup();
    render(<SettingsDrawer {...makeProps()} />);

    await openPanel(user);
    await user.click(screen.getByText('All'));

    await waitFor(() => {
      screen.getAllByRole('checkbox').forEach(cb => expect(cb).toBeChecked());
    });
  });

  it('"None" unchecks every checkbox and saves them all as hidden', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<SettingsDrawer {...props} />);

    await openPanel(user);
    await user.click(screen.getByText('None'));

    await waitFor(() => {
      screen.getAllByRole('checkbox').forEach(cb => expect(cb).not.toBeChecked());
    });

    await user.click(screen.getByText('Save'));

    await waitFor(() => expect(props.onOk).toHaveBeenCalledWith({ 1: false, 2: false, 3: false }));
  });

  it('closes via the drawer close (X) button', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<SettingsDrawer {...props} />);

    // antd Drawer renders a close button labelled "Close".
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /close/i }));

    expect(props.onCancel).toHaveBeenCalled();
  });

  describe('when form validation fails', () => {
    let spy: ReturnType<typeof vi.spyOn>;

    afterEach(() => spy?.mockRestore());

    it('does not call onOk if validateFields rejects', async () => {
      const user = userEvent.setup();
      // Keep the real form (so <Form> still works) but force validateFields to reject →
      // `await ….catch(() => null)` yields null → the `if (!values) return` guard short-circuits.
      const realUseForm = Form.useForm;
      spy = vi.spyOn(Form, 'useForm').mockImplementation((...args) => {
        const [form] = realUseForm(...args);
        vi.spyOn(form, 'validateFields').mockRejectedValue(new Error('invalid'));
        return [form];
      });

      const props = makeProps();
      render(<SettingsDrawer {...props} />);

      await openPanel(user);
      await user.click(screen.getByText('Save'));

      await waitFor(() => expect(props.onOk).not.toHaveBeenCalled());
    });
  });
});
