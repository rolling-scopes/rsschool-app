import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { NoConsentView, confirmationModalInfo } from '../NoConsentView';

describe('NoConsentView', () => {
  it('should render 403 correctly', () => {
    render(<NoConsentView giveConsent={jest.fn()} />);

    expect(screen.getByText("This user doesn't have CV yet")).toBeInTheDocument();
  });

  it('should render initial owner view correctly', () => {
    render(<NoConsentView isOwner={true} giveConsent={jest.fn()} />);

    const title = screen.getByText("You don't have a CV yet.");
    const createCvButton = screen.getByText('Create CV');
    expect(title).toBeInTheDocument();
    expect(createCvButton).toBeInTheDocument();
  });

  it('should show confirmation modal correctly', async () => {
    render(<NoConsentView isOwner={true} giveConsent={jest.fn()} />);

    const createCvButton = screen.getByText('Create CV');

    fireEvent.click(createCvButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByTitle(confirmationModalInfo.en.header)).toBeInTheDocument();
      confirmationModalInfo.en.availableDataList.forEach(text => expect(screen.getByText(text)).toBeInTheDocument());
    });
  });

  it('should show tooltips correctly', async () => {
    render(<NoConsentView isOwner={true} giveConsent={jest.fn()} />);

    const createCvButton = screen.getByText('Create CV');

    fireEvent.click(createCvButton);

    const titleTooltipIcon = await screen.findByTestId(confirmationModalInfo.ru.header);

    expect(titleTooltipIcon).toBeInTheDocument();

    fireEvent.mouseEnter(titleTooltipIcon);

    const titleTooltipText = await screen.findByText(confirmationModalInfo.ru.header);

    expect(titleTooltipText).toBeInTheDocument();

    for (const text of confirmationModalInfo.ru.availableDataList) {
      const tooltipIcon = await screen.findByTestId(text);

      expect(tooltipIcon).toBeInTheDocument();

      fireEvent.mouseEnter(tooltipIcon);

      const tooltipText = await screen.findByText(text);

      expect(tooltipText).toBeInTheDocument();
    }
  });
});
