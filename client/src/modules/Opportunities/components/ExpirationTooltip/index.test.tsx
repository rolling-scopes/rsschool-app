import { render, screen, fireEvent, within } from '@testing-library/react';
import { ExpirationState } from 'modules/Opportunities/constants';
import { ExpirationTooltip } from './index';

const mockSystemTime = new Date('2022-09-26T13:41:39.161Z');

describe('ExpirationTooltip', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(mockSystemTime);
  });

  test('should work correctly in case if CV is far from expiration', async () => {
    const datestring30DaysAfter = '2022-10-26';

    render(<ExpirationTooltip expirationDate={datestring30DaysAfter} expirationState={ExpirationState.NotExpired} />);

    const button = screen.getByRole('button', { name: 'Public' });
    const expirationText = screen.getByText(`Expires on ${datestring30DaysAfter}`);

    expect(button).toBeInTheDocument();
    expect(expirationText).toBeInTheDocument();

    fireEvent.click(button);

    const modal = await screen.findByRole('dialog');

    expect(modal).toBeInTheDocument();
    const title = within(modal).getByText(`Your CV is public until ${datestring30DaysAfter}`);
    const text = within(modal).getByText(/If you won't renew your CV until this date/);
    expect(title).toBeInTheDocument();
    expect(text).toBeInTheDocument();
    expect(within(modal).getAllByRole('button')).toHaveLength(2);

    // Modal is rendered outside of the container, this is custom cleanup
    modal.remove();
  });

  test('should work correctly in case if CV is nearly expired', async () => {
    const datestring1DayAfter = '2022-09-27';

    render(<ExpirationTooltip expirationDate={datestring1DayAfter} expirationState={ExpirationState.NearlyExpired} />);

    const button = await screen.findByRole('button', { name: 'Public' });
    const expirationText = await screen.findByText(`Expires on ${datestring1DayAfter}`);

    expect(button).toBeInTheDocument();
    expect(expirationText).toBeInTheDocument();

    fireEvent.click(button);

    const modal = await screen.findByRole('dialog');

    expect(modal).toBeInTheDocument();

    const title = within(modal).getByText(`Your CV will expire in 2 days on ${datestring1DayAfter}`);
    const text = within(modal).getByText(/If you won't renew your CV until this date/);

    expect(title).toBeInTheDocument();
    expect(text).toBeInTheDocument();
    expect(within(modal).getAllByRole('button')).toHaveLength(2);

    // Modal is rendered outside of the container, this is custom cleanup
    modal.remove();
  });

  test('should show expiration modal without click on button in case if CV is expired', async () => {
    const datestring1DayBefore = '2022-09-25';

    render(<ExpirationTooltip expirationDate={datestring1DayBefore} expirationState={ExpirationState.Expired} />);

    const button = await screen.findByRole('button', { name: 'Archived' });
    const expirationText = await screen.findByText(`Expired on ${datestring1DayBefore}`);

    expect(button).toBeInTheDocument();
    expect(expirationText).toBeInTheDocument();

    const modal = await screen.findByRole('dialog');

    expect(modal).toBeInTheDocument();

    const title = within(modal).getByText('Your CV is archived');
    const text = within(modal).getByText(/You need to renew your resume/i);

    expect(title).toBeInTheDocument();
    expect(text).toBeInTheDocument();
    expect(within(modal).getAllByRole('button')).toHaveLength(2);

    // Modal is rendered outside of the container, this is custom cleanup
    modal.remove();
  });

  test('should show expiration modal on click in case if CV is expired', async () => {
    const datestring1DayBefore = '2022-09-25';

    render(<ExpirationTooltip expirationDate={datestring1DayBefore} expirationState={ExpirationState.Expired} />);

    // Close initially opened modal
    fireEvent.click(await screen.findByText('Cancel'));

    const button = await screen.findByRole('button', { name: 'Archived' });

    fireEvent.click(button);

    const modal = await screen.findByRole('dialog');

    expect(modal).toBeInTheDocument();

    const title = within(modal).getByText('Your CV is archived');
    const text = within(modal).getByText(/You need to renew your resume/i);

    expect(title).toBeInTheDocument();
    expect(text).toBeInTheDocument();
    expect(within(modal).getAllByRole('button')).toHaveLength(2);

    // Modal is rendered outside of the container, this is custom cleanup
    modal.remove();
  });
});
