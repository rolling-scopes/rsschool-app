import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileMainCardData } from '@client/services/user';
import MainCard from '../MainCard';

// Stub the remote (Google Maps) LocationSelect with a simple value-emitting control so
// handleLocationChange can be exercised without the maps integration.
const { obfuscateProfile } = vi.hoisted(() => ({
  obfuscateProfile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@client/shared/components/Forms', () => ({
  LocationSelect: ({ onChange }: { onChange: (value: { cityName: string; countryName: string } | null) => void }) => (
    <>
      <button type="button" onClick={() => onChange({ cityName: 'Berlin', countryName: 'Germany' })}>
        pick-location
      </button>
      <button type="button" onClick={() => onChange(null)}>
        clear-location
      </button>
    </>
  ),
}));

vi.mock('@client/api', () => ({
  ProfileApi: function ProfileApi() {
    return { obfuscateProfile };
  },
}));

const mockData: ProfileMainCardData = {
  name: 'John Doe',
  githubId: 'john-doe',
  location: {
    countryName: 'Belarus',
    cityName: 'Minsk',
  },
  publicCvUrl: 'public-url',
};

const makeProps = (overrides: Partial<React.ComponentProps<typeof MainCard>> = {}) => ({
  data: mockData,
  isEditingModeEnabled: true,
  updateProfile: vi.fn().mockResolvedValue(true),
  ...overrides,
});

describe('MainCard', () => {
  describe('Should render correctly', () => {
    it('if editing mode is disabled', () => {
      const { container } = render(<MainCard data={mockData} isEditingModeEnabled={false} updateProfile={vi.fn()} />);
      expect(container).toMatchSnapshot();
    });
    it('if editing mode is enabled', () => {
      const { container } = render(<MainCard data={mockData} isEditingModeEnabled={true} updateProfile={vi.fn()} />);
      expect(container).toMatchSnapshot();
    });
  });

  it('renders without optional fields (no avatar, no location, no public CV)', () => {
    render(
      <MainCard
        data={{ name: 'No Github', githubId: null, location: null, publicCvUrl: null }}
        isEditingModeEnabled={false}
        updateProfile={vi.fn()}
      />,
    );

    expect(screen.getByText('No Github')).toBeInTheDocument();
    expect(screen.queryByText('Public CV')).not.toBeInTheDocument();
  });

  it('edits the name, saves and reflects the new value on success', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(true);
    render(<MainCard {...makeProps({ updateProfile })} />);

    await user.click(screen.getByRole('img', { name: 'edit' }));

    const nameInput = screen.getByPlaceholderText('First-name Last-name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Roe');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith({ name: 'Jane Roe' }));
    expect(await screen.findByText('Jane Roe')).toBeInTheDocument();
  });

  it('edits the location and includes city/country in the update payload', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(true);
    render(<MainCard {...makeProps({ updateProfile })} />);

    await user.click(screen.getByRole('img', { name: 'edit' }));
    await user.click(screen.getByRole('button', { name: 'pick-location' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith({ cityName: 'Berlin', countryName: 'Germany' }));
    expect(await screen.findByText('Berlin, Germany')).toBeInTheDocument();
  });

  it('sends null city/country when the location is cleared (hits the `?? null` branch)', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(true);
    render(<MainCard {...makeProps({ updateProfile })} />);

    await user.click(screen.getByRole('img', { name: 'edit' }));
    await user.click(screen.getByRole('button', { name: 'clear-location' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith({ cityName: null, countryName: null }));
  });

  it('keeps the previous displayed values when the update fails', async () => {
    const user = userEvent.setup();
    const updateProfile = vi.fn().mockResolvedValue(false);
    render(<MainCard {...makeProps({ updateProfile })} />);

    await user.click(screen.getByRole('img', { name: 'edit' }));
    const nameInput = screen.getByPlaceholderText('First-name Last-name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Rejected Name');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(updateProfile).toHaveBeenCalled());
    // display still shows the original name because save was rejected
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Rejected Name')).not.toBeInTheDocument();
  });

  it('restores the original name when the edit is cancelled', async () => {
    const user = userEvent.setup();
    render(<MainCard {...makeProps()} />);

    await user.click(screen.getByRole('img', { name: 'edit' }));
    const nameInput = screen.getByPlaceholderText('First-name Last-name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Discarded');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // reopening shows the restored original value
    await user.click(screen.getByRole('img', { name: 'edit' }));
    expect(screen.getByPlaceholderText('First-name Last-name')).toHaveValue('John Doe');
  });

  it('keeps Save disabled when the name is only whitespace and enables it on a real change', async () => {
    const user = userEvent.setup();
    render(<MainCard {...makeProps()} />);

    await user.click(screen.getByRole('img', { name: 'edit' }));
    const nameInput = screen.getByPlaceholderText('First-name Last-name');

    await user.clear(nameInput);
    await user.type(nameInput, '   ');
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();

    await user.clear(nameInput);
    await user.type(nameInput, 'Real Name');
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('opens the obfuscate modal for admins', async () => {
    const user = userEvent.setup();
    render(<MainCard {...makeProps({ isAdmin: true, isEditingModeEnabled: false })} />);

    await user.click(screen.getByRole('button', { name: 'Obfuscate' }));
    expect(screen.getByText('Confirm GitHub Profile Obfuscation')).toBeInTheDocument();
  });

  it('does not render the obfuscate button when not admin', () => {
    render(<MainCard {...makeProps({ isAdmin: false, isEditingModeEnabled: false })} />);
    expect(screen.queryByRole('button', { name: 'Obfuscate' })).not.toBeInTheDocument();
  });
});
