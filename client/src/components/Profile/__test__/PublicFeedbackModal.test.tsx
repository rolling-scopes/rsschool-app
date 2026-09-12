import { fireEvent, render, screen, within } from '@testing-library/react';
import PublicFeedbackModal from '../PublicFeedbackModal';

describe('PublicFeedbackModal', () => {
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

  beforeAll(() => {
    vi.useFakeTimers().setSystemTime(new Date('2022-01-01T00:00:00Z').getTime());
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('renders and handles populated, empty, and hidden states', () => {
    const onHide = vi.fn();
    const { container, rerender } = render(<PublicFeedbackModal data={data} isVisible={true} onHide={onHide} />);
    expect(container).toMatchSnapshot();

    const mixed = [
      {
        feedbackDate: '2021-01-01T00:00:00.000Z',
        badgeId: 'Congratulations', // known -> resolves to friendly name
        comment: 'Known badge comment',
        heroesUri: 'https://heroes.by/',
        fromUser: { name: 'Known User', githubId: 'known' },
      },
      {
        feedbackDate: '2021-01-02T00:00:00.000Z',
        badgeId: 'NonexistentBadge', // truthy but not in heroesBadges -> ?? '' branch
        comment: 'Unknown badge comment',
        heroesUri: 'https://heroes.by/',
        fromUser: { name: 'Unknown Badge User', githubId: 'unknownbadge' },
      },
      {
        feedbackDate: '2021-01-03T00:00:00.000Z',
        badgeId: '', // falsy -> the ternary else ('') branch
        comment: 'No badge comment',
        heroesUri: 'https://heroes.by/',
        fromUser: { name: 'No Badge User', githubId: 'nobadge' },
      },
    ];

    rerender(<PublicFeedbackModal data={mixed} isVisible={true} onHide={onHide} />);

    expect(screen.getByText('Congratulations')).toBeInTheDocument();
    expect(screen.getByText('Known badge comment')).toBeInTheDocument();
    expect(screen.getByText('Unknown badge comment')).toBeInTheDocument();
    expect(screen.getByText('No badge comment')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Known User' })).toHaveAttribute('href', '/profile?githubId=known');

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /close/i }));
    expect(onHide).toHaveBeenCalled();

    rerender(<PublicFeedbackModal data={[]} isVisible={true} onHide={onHide} />);
    expect(screen.getByText('Public Feedback')).toBeInTheDocument();

    rerender(<PublicFeedbackModal data={data} isVisible={false} onHide={onHide} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
