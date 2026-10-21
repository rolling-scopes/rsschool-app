import { render, screen } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import SolutionReviewSettingsPanel from './SolutionReviewSettingsPanel';

describe('<SolutionReviewSettingsPanel />', () => {
  it('renders and toggles contact visibility with optional callbacks', async () => {
    const user = setupUser();
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
