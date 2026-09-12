import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SolutionReviewSettingsPanel from './SolutionReviewSettingsPanel';

describe('<SolutionReviewSettingsPanel />', () => {
  it('renders and toggles contact visibility with optional callbacks', async () => {
    const user = userEvent.setup();
    const setAreContactsVisible = vi.fn();
    const { rerender } = render(
      <SolutionReviewSettingsPanel settings={{ areContactsVisible: false, setAreContactsVisible }} />,
    );

    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByRole('switch')).not.toBeChecked();
    await user.click(screen.getByRole('switch'));
    expect(setAreContactsVisible).toHaveBeenCalledWith(true);

    rerender(<SolutionReviewSettingsPanel settings={{ areContactsVisible: true }} />);
    expect(screen.getByRole('switch')).toBeChecked();
    await user.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });
});
