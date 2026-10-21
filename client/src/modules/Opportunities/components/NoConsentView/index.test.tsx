import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { NoConsentView, confirmationModalInfo } from '../NoConsentView';

async function finishTooltipTransition() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(300);
  });
}

describe('NoConsentView', () => {
  afterEach(() => {
    if (vi.isFakeTimers()) vi.clearAllTimers();
    vi.useRealTimers();
  });
  it('should render 403 correctly', () => {
    render(<NoConsentView giveConsent={vi.fn()} />);

    expect(screen.getByText("This user doesn't have CV yet")).toBeInTheDocument();
  });

  it('renders the owner view, opens the consent details and cancels', async () => {
    const giveConsent = vi.fn();
    render(<NoConsentView isOwner={true} giveConsent={giveConsent} />);

    expect(screen.getByRole('heading', { name: "You don't have a CV yet." })).toBeInTheDocument();
    const createCvButton = screen.getByRole('button', { name: 'plus Create CV' });
    expect(createCvButton).toBeInTheDocument();
    fireEvent.click(createCvButton);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(confirmationModalInfo.en.header)).toBeInTheDocument();
    for (const text of confirmationModalInfo.en.availableDataList) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    expect(cancelButton).toBeInTheDocument();
    fireEvent.click(cancelButton);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(giveConsent).not.toHaveBeenCalled();
  });

  it('shows the translated header and detail tooltips', async () => {
    render(<NoConsentView isOwner={true} giveConsent={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'plus Create CV' }));
    await screen.findByRole('dialog');
    vi.useFakeTimers();

    for (const text of [confirmationModalInfo.ru.header, ...confirmationModalInfo.ru.availableDataList]) {
      const tooltipIcon = screen.getByTestId(text);
      expect(tooltipIcon).toBeInTheDocument();
      fireEvent.mouseEnter(tooltipIcon);
      await finishTooltipTransition();
      expect(screen.getByRole('tooltip', { name: text })).toHaveTextContent(text);
      expect(tooltipIcon).toHaveAttribute('data-testid', text);
      fireEvent.mouseLeave(tooltipIcon);
      await finishTooltipTransition();
      expect(screen.queryByRole('tooltip', { name: text })).not.toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await finishTooltipTransition();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should handle consent correctly', async () => {
    const mockGiveConsent = vi.fn();

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
