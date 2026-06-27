import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('should render correctly', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2019-01-01'));
    const { container } = render(<PublicFeedbackCard data={data} />);
    expect(container).toMatchSnapshot();
  });

  it('opens the public feedback modal when the fullscreen action is clicked, then closes it', async () => {
    const user = userEvent.setup();
    render(<PublicFeedbackCard data={data} />);

    // modal is not visible initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('img', { name: 'fullscreen' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // close via the modal Close button -> hidePublicFeedbackModal
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows the total badge count and renders the last feedback', () => {
    render(<PublicFeedbackCard data={data} />);
    expect(screen.getByText('Total badges:')).toBeInTheDocument();
    expect(screen.getByText('Last feedback:')).toBeInTheDocument();
  });

  it('handles feedback entries with and without a badgeId (badgeId branch)', () => {
    const mixed = [{ ...data[0], badgeId: '' }, { ...data[1] }];
    render(<PublicFeedbackCard data={mixed} />);
    // last feedback is the first item which has no badgeId -> renders empty badge label, no crash
    expect(screen.getByText('Total badges:')).toBeInTheDocument();
  });

  it('renders an empty list without badges (countBadges with empty data)', () => {
    render(<PublicFeedbackCard data={[]} />);
    expect(screen.getByText('Total badges:')).toBeInTheDocument();
  });
});
