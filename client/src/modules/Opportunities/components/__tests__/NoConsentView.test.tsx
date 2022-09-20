import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { NoConsentView, confirmationModalInfo } from '../NoConsentView';

describe('NoConsentView', () => {
  afterEach(cleanup);

  it('should render 403 correctly', () => {
    render(<NoConsentView giveConsent={jest.fn()} />);

    expect(screen.getByText("This user doesn't have CV yet")).toBeInTheDocument();
  });

  it('should render initial owner view correctly', () => {
    render(<NoConsentView isOwner={true} giveConsent={jest.fn()} />);

    const title = screen.getByRole('heading', { name: "You don't have a CV yet." });
    const createCvButton = screen.getByRole('button', { name: 'plus Create CV' });

    expect(title).toBeInTheDocument();
    expect(createCvButton).toBeInTheDocument();
  });

  it('should show confirmation modal correctly', async () => {
    render(<NoConsentView isOwner={true} giveConsent={jest.fn()} />);

    const createCvButton = screen.getByRole('button', { name: 'plus Create CV' });

    fireEvent.click(createCvButton);

    const modal = await screen.findByRole('dialog');
    const modalTitle = await screen.findByText(confirmationModalInfo.en.header);

    expect(modal).toBeInTheDocument();

    // Check that we have all visible texts
    expect(modalTitle).toBeInTheDocument();
    confirmationModalInfo.en.availableDataList.forEach(text => expect(screen.getByText(text)).toBeInTheDocument());

    // Check that title tooltip works correctly
    const titleTooltipIcon = await screen.findByTestId(confirmationModalInfo.ru.header);

    expect(titleTooltipIcon).toBeInTheDocument();

    fireEvent.mouseEnter(titleTooltipIcon);

    const titleTooltipText = await screen.findByText(confirmationModalInfo.ru.header);

    expect(titleTooltipText).toBeInTheDocument();

    // Check that list items tooltips works correctly
    for (const text of confirmationModalInfo.ru.availableDataList) {
      const tooltipIcon = await screen.findByTestId(text);

      expect(tooltipIcon).toBeInTheDocument();

      fireEvent.mouseEnter(tooltipIcon);

      const tooltipText = await screen.findByText(text);

      expect(tooltipText).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  });

  it('should handle cancel correctly', async () => {
    render(<NoConsentView isOwner={true} giveConsent={jest.fn()} />);

    const createCvButton = screen.getByRole('button', { name: 'plus Create CV' });

    fireEvent.click(createCvButton);

    const modal = await screen.findByRole('dialog');

    expect(modal).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should handle consent correctly', async () => {
    const mockGiveConsent = jest.fn();

    render(<NoConsentView isOwner={true} giveConsent={mockGiveConsent} />);

    const createCvButton = screen.getByRole('button', { name: 'plus Create CV' });

    fireEvent.click(createCvButton);

    const consentButton = await screen.findByRole('button', { name: 'I consent' });

    fireEvent.click(consentButton);

    expect(mockGiveConsent).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
