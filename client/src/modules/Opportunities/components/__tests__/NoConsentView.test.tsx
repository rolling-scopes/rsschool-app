import { render, screen } from '@testing-library/react';
import { NoConsentView } from '../NoConsentView';

describe('NoConsentView', () => {
  it('should render 403 correctly', () => {
    render(<NoConsentView giveConsent={jest.fn()} />);

    expect(screen.getByText("This user doesn't have CV yet")).toBeInTheDocument();
  });

  it('should render owner view correctly', () => {
    render(<NoConsentView isOwner={true} giveConsent={jest.fn()} />);

    const title = screen.getByText("You don't have a CV yet.");
    const createCvButton = screen.getByText('Create CV');
    expect(title).toBeInTheDocument();
    expect(createCvButton).toBeInTheDocument();
  });
});
