import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SolutionReviewSettingsPanel from './SolutionReviewSettingsPanel';

describe('<SolutionReviewSettingsPanel />', () => {
  it('renders the contacts label and an unchecked switch by default', () => {
    render(<SolutionReviewSettingsPanel settings={{ areContactsVisible: false, setAreContactsVisible: vi.fn() }} />);

    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('renders a checked switch when contacts are visible', () => {
    render(<SolutionReviewSettingsPanel settings={{ areContactsVisible: true, setAreContactsVisible: vi.fn() }} />);

    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('toggles contact visibility when the switch is clicked', async () => {
    const user = userEvent.setup();
    const setAreContactsVisible = vi.fn();
    render(<SolutionReviewSettingsPanel settings={{ areContactsVisible: false, setAreContactsVisible }} />);

    await user.click(screen.getByRole('switch'));

    expect(setAreContactsVisible).toHaveBeenCalledWith(true);
  });

  it('does not throw when setAreContactsVisible is not provided', async () => {
    const user = userEvent.setup();
    render(<SolutionReviewSettingsPanel settings={{ areContactsVisible: true }} />);

    await user.click(screen.getByRole('switch'));

    expect(screen.getByRole('switch')).toBeInTheDocument();
  });
});
