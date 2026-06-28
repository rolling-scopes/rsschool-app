import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactsCard from '../ContactsCard';

// epamEmail must match /[^@]+_[^@]+@epam.com/ and email must be a valid email so that
// editing an unrelated field does not trip the form validation (which would set hasError
// and keep Save disabled). See epamEmailPattern in services/validators.
const fullData = {
  epamEmail: 'vasya_pupkin@epam.com',
  phone: '1232422',
  email: 'vasya@tut.by',
  skype: 'skype_vasya',
  telegram: 'televasya',
  notes: 'vasya',
  linkedIn: 'http://linkedin_test.com/vasya',
  whatsApp: '1234567890',
};

const makeProps = (overrides: Partial<React.ComponentProps<typeof ContactsCard>> = {}) => ({
  data: fullData,
  isEditingModeEnabled: true,
  sendConfirmationEmail: vi.fn(),
  connections: {},
  updateProfile: vi.fn().mockResolvedValue(true),
  ...overrides,
});

describe('ContactsCard', () => {
  describe('Should render correctly', () => {
    it('if editing mode is disabled', () => {
      const { container } = render(
        <ContactsCard
          data={{
            epamEmail: 'vasya@epam.com',
            phone: '1232422',
            email: 'vasya@tut.by',
            skype: 'skype_vasya',
            telegram: 'televasya',
            notes: 'vasya',
            linkedIn: 'http://linkedin_test.com/vasya',
            whatsApp: '1234567890',
          }}
          isEditingModeEnabled={false}
          sendConfirmationEmail={vi.fn()}
          connections={{}}
          updateProfile={vi.fn()}
        />,
      );
      expect(container).toMatchSnapshot();
    });
    it('if editing mode is enabled', () => {
      const { container } = render(
        <ContactsCard
          data={{
            epamEmail: 'vasya@epam.com',
            phone: '1232422',
            email: 'vasya@tut.by',
            skype: 'skype_vasya',
            telegram: null,
            notes: null,
            linkedIn: null,
            whatsApp: '1234567890',
          }}
          isEditingModeEnabled={true}
          sendConfirmationEmail={vi.fn()}
          connections={{}}
          updateProfile={vi.fn()}
        />,
      );
      expect(container).toMatchSnapshot();
    });
  });

  it('renders the no-data placeholder when no contacts are filled', () => {
    render(
      <ContactsCard
        {...makeProps({
          data: {
            epamEmail: null,
            phone: null,
            email: null,
            skype: null,
            telegram: null,
            notes: null,
            linkedIn: null,
            whatsApp: null,
          },
          isEditingModeEnabled: false,
        })}
      />,
    );
    expect(screen.getByText(/Contacts aren't filled in/)).toBeInTheDocument();
  });

  it('shows the EmailConfirmation prompt for an unconfirmed email in editing mode', () => {
    render(<ContactsCard {...makeProps({ connections: { email: { value: 'vasya@tut.by', enabled: false } } })} />);
    expect(screen.getByText('Send confirmation email?')).toBeInTheDocument();
  });

  it('does not show the EmailConfirmation prompt when the email connection is enabled', () => {
    render(<ContactsCard {...makeProps({ connections: { email: { value: 'vasya@tut.by', enabled: true } } })} />);
    expect(screen.queryByText('Send confirmation email?')).not.toBeInTheDocument();
  });

  it('calls sendConfirmationEmail when the confirmation link is clicked', async () => {
    const user = userEvent.setup();
    const sendConfirmationEmail = vi.fn();
    render(
      <ContactsCard
        {...makeProps({ sendConfirmationEmail, connections: { email: { value: 'vasya@tut.by', enabled: false } } })}
      />,
    );

    await user.click(screen.getByText('Send confirmation email?'));
    expect(sendConfirmationEmail).toHaveBeenCalledTimes(1);
  });

  it('edits a contact, saves and reflects the new value on success (handleSave)', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(true);
    render(<ContactsCard {...makeProps({ updateProfile })} />);

    await user.click(screen.getByRole('img', { name: 'edit' }));

    const dialog = screen.getByRole('dialog');
    // Telegram is the 3rd contact field in the form
    const telegramInput = within(dialog).getByDisplayValue('televasya');
    await user.clear(telegramInput);
    await user.type(telegramInput, 'new_tg');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({ contactsTelegram: 'new_tg' })),
    );
    await waitFor(() => expect(screen.getAllByText('new_tg').length).toBeGreaterThan(0));
  });

  it('does not commit displayed values when the update fails (handleSave early return)', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(false);
    render(<ContactsCard {...makeProps({ updateProfile })} />);

    await user.click(screen.getByRole('img', { name: 'edit' }));
    const dialog = screen.getByRole('dialog');
    const telegramInput = within(dialog).getByDisplayValue('televasya');
    await user.clear(telegramInput);
    await user.type(telegramInput, 'rejected_tg');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalled());
    // the displayed contacts list still shows the original telegram value
    expect(screen.getAllByText('televasya').length).toBeGreaterThan(0);
  });

  it('restores the displayed contacts on cancel (handleCancel)', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn();
    render(<ContactsCard {...makeProps({ updateProfile })} />);

    await user.click(screen.getByRole('img', { name: 'edit' }));
    const dialog = screen.getByRole('dialog');
    const telegramInput = within(dialog).getByDisplayValue('televasya');
    await user.clear(telegramInput);
    await user.type(telegramInput, 'discarded_tg');
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // nothing was persisted, and the displayed contacts list still shows the original telegram
    expect(updateProfile).not.toHaveBeenCalled();
    expect(screen.getAllByText('televasya').length).toBeGreaterThan(0);
    // NOTE: handleCancel resets the parent `values`/`hasError` state but NOT the inner
    // antd form, so the modal form input keeps the discarded draft (latent UI bug).
  });
});
