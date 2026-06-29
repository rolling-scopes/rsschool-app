import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommonCardWithSettingsModal from '../CommonCardWithSettingsModal';

function renderCard(overrides: Partial<React.ComponentProps<typeof CommonCardWithSettingsModal>> = {}) {
  const props = {
    title: 'Test',
    icon: <i>Icon</i>,
    content: <p>Card body</p>,
    profileSettingsContent: <div>Settings content</div>,
    isEditingModeEnabled: true,
    saveProfile: vi.fn(),
    cancelChanges: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<CommonCardWithSettingsModal {...props} />) };
}

describe('CommonCardWithSettingsModal', () => {
  describe('Should render correctly', () => {
    it('if just basic props are present', () => {
      const { container } = renderCard();
      expect(container).toMatchSnapshot();
    });
    it('if null content is passed and editing mode is disabled', () => {
      const { container } = renderCard({ content: null, isEditingModeEnabled: false });
      expect(container).toMatchSnapshot();
    });
  });

  it('does not render the edit affordance or modal when editing is disabled', () => {
    renderCard({ isEditingModeEnabled: false });
    expect(screen.queryByRole('img', { name: 'edit' })).not.toBeInTheDocument();
    expect(screen.queryByText('Settings content')).not.toBeInTheDocument();
  });

  it('opens the settings modal and saves changes', async () => {
    const user = userEvent.setup();
    const saveProfile = vi.fn();
    renderCard({ saveProfile });

    await user.click(screen.getByRole('img', { name: 'edit' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Settings content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(saveProfile).toHaveBeenCalledTimes(1);
    // closing hides the dialog (antd keeps content mounted, so assert on dialog visibility)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('opens the settings modal and discards changes on cancel', async () => {
    const user = userEvent.setup();
    const cancelChanges = vi.fn();
    const saveProfile = vi.fn();
    renderCard({ cancelChanges, saveProfile });

    await user.click(screen.getByRole('img', { name: 'edit' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(cancelChanges).toHaveBeenCalledTimes(1);
    expect(saveProfile).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('disables the Save button when isSaveDisabled is set', async () => {
    const user = userEvent.setup();
    renderCard({ isSaveDisabled: true });

    await user.click(screen.getByRole('img', { name: 'edit' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('uses a custom settings title when provided', async () => {
    const user = userEvent.setup();
    renderCard({ settingsTitle: 'Custom Settings' });

    await user.click(screen.getByRole('img', { name: 'edit' }));
    expect(screen.getByText('Custom Settings')).toBeInTheDocument();
  });
});
