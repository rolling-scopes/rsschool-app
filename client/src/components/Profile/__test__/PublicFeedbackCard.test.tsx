import { render, screen, waitFor } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import PublicFeedbackCard from '../PublicFeedbackCard';

describe('PublicFeedbackCard', () => {
  const data = [
    {
      feedbackDate: '2018-12-01T12:12:01.000Z',
      badgeId: 'Congratulations',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Anton Petrov',
        githubId: 'apetr',
      },
    },
    {
      feedbackDate: '2018-11-01T11:12:01.000Z',
      badgeId: 'Great_speaker',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Artem Petrov',
        githubId: 'temap',
      },
    },
    {
      feedbackDate: '2018-09-01T11:12:01.000Z',
      badgeId: 'Great_speaker',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Artem Petrov',
        githubId: 'temap',
      },
    },
    {
      feedbackDate: '2018-10-01T11:12:01.000Z',
      badgeId: 'Great_speaker',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Artem Petrov',
        githubId: 'temap',
      },
    },
    {
      feedbackDate: '2018-11-01T12:12:01.000Z',
      badgeId: 'Thank_you',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Anton Vasilyev',
        githubId: 'vasssa',
      },
    },
    {
      feedbackDate: '2019-12-01T12:12:01.000Z',
      badgeId: 'Thank_you',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Dima Alexandrov',
        githubId: 'demaa',
      },
    },
  ];

  afterEach(() => {
    vi.useRealTimers();
  });

  it('matches the feedback card snapshot', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2019-01-01'));
    const { container } = render(<PublicFeedbackCard data={data} />);
    expect(container).toMatchSnapshot();
  });

  it('renders feedback details and opens and closes the modal', async () => {
    const user = setupUser();
    render(<PublicFeedbackCard data={data} />);

    expect(screen.getByText('Total badges:')).toBeInTheDocument();
    expect(screen.getByText('Last feedback:')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('img', { name: 'fullscreen' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('handles feedback with no badge and empty feedback', () => {
    const mixed = [{ ...data[0], badgeId: '' }, { ...data[1] }];
    const { rerender } = render(<PublicFeedbackCard data={mixed} />);
    expect(screen.getByText('Total badges:')).toBeInTheDocument();

    rerender(<PublicFeedbackCard data={[]} />);
    expect(screen.getByText('Total badges:')).toBeInTheDocument();
  });
});
