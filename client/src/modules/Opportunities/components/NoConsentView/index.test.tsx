import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { NoConsentView, confirmationModalInfo } from '../NoConsentView';

describe('NoConsentView', () => {
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

  it('should show confirmation modal', async () => {
    render(<NoConsentView isOwner={true} giveConsent={jest.fn()} />);

    const createCvButton = screen.getByRole('button', { name: 'plus Create CV' });

    fireEvent.click(createCvButton);

    const modal = await screen.findByRole('dialog');
    const modalTitle = await screen.findByText(confirmationModalInfo.en.header);

    expect(modal).toBeInTheDocument();
    expect(modalTitle).toBeInTheDocument();

    // close modal
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      const modal = screen.queryByRole('dialog');
      expect(modal).not.toBeInTheDocument();
    });
  });

  it('should render tooltip', async () => {
    render(<NoConsentView isOwner={true} giveConsent={jest.fn()} />);

    const createCvButton = screen.getByRole('button', { name: 'plus Create CV' });

    fireEvent.click(createCvButton);

    const titleTooltipIcon = await screen.findByTestId(confirmationModalInfo.ru.header);
    expect(titleTooltipIcon).toBeInTheDocument();

    fireEvent.mouseEnter(titleTooltipIcon);

    await waitFor(() => {
      expect(titleTooltipIcon).toHaveAttribute('data-testid', confirmationModalInfo.ru.header);
    });

    // close modal
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      const modal = screen.queryByRole('dialog');
      expect(modal).not.toBeInTheDocument();
    });
  });

  it.each`
    text
    ${confirmationModalInfo.en.availableDataList[0]}
    ${confirmationModalInfo.en.availableDataList[1]}
    ${confirmationModalInfo.en.availableDataList[2]}
    ${confirmationModalInfo.en.availableDataList[3]}
  `('should render visible text $text', async ({ text }) => {
    render(<NoConsentView isOwner={true} giveConsent={jest.fn()} />);

    const createCvButton = screen.getByRole('button', { name: 'plus Create CV' });

    fireEvent.click(createCvButton);

    await waitFor(() => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });

    // close modal
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      const modal = screen.queryByRole('dialog');
      expect(modal).not.toBeInTheDocument();
    });
  });

  it.each`
    text
    ${confirmationModalInfo.ru.availableDataList[0]}
    ${confirmationModalInfo.ru.availableDataList[1]}
    ${confirmationModalInfo.ru.availableDataList[2]}
    ${confirmationModalInfo.ru.availableDataList[3]}
  `('should render tooltip $text', async ({ text }) => {
    render(<NoConsentView isOwner={true} giveConsent={jest.fn()} />);

    const createCvButton = screen.getByRole('button', { name: 'plus Create CV' });

    fireEvent.click(createCvButton);

    const tooltipIcon = await screen.findByTestId(text);
    expect(tooltipIcon).toBeInTheDocument();

    fireEvent.mouseEnter(tooltipIcon);

    await waitFor(() => {
      expect(tooltipIcon).toHaveAttribute('data-testid', text);
    });

    // close modal
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      const modal = screen.queryByRole('dialog');
      expect(modal).not.toBeInTheDocument();
    });
  });

  it('should handle cancel correctly', async () => {
    render(<NoConsentView isOwner={true} giveConsent={jest.fn()} />);

    const createCvButton = screen.getByRole('button', { name: 'plus Create CV' });
    expect(createCvButton).toBeInTheDocument();

    fireEvent.click(createCvButton);

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
    expect(cancelButton).toBeInTheDocument();

    // close modal
    fireEvent.click(cancelButton);

    await waitFor(() => {
      const modal = screen.queryByRole('dialog');
      expect(modal).not.toBeInTheDocument();
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
