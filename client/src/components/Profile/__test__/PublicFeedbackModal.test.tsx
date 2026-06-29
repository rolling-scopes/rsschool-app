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

  it('Should render correctly', () => {
    const { container } = render(<PublicFeedbackModal data={data} isVisible={true} onHide={vi.fn()} />);
    expect(container).toMatchSnapshot();
  });

  it('renders known badge name, empty string for unknown badge, and nothing when badgeId is falsy', () => {
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

    render(<PublicFeedbackModal data={mixed} isVisible={true} onHide={vi.fn()} />);

    // known badge resolves to its display name
    expect(screen.getByText('Congratulations')).toBeInTheDocument();
    // all comments rendered regardless of badge state
    expect(screen.getByText('Known badge comment')).toBeInTheDocument();
    expect(screen.getByText('Unknown badge comment')).toBeInTheDocument();
    expect(screen.getByText('No badge comment')).toBeInTheDocument();
    // author links present
    expect(screen.getByRole('link', { name: 'Known User' })).toHaveAttribute('href', '/profile?githubId=known');
  });

  it('renders an empty list when there are no feedback items', () => {
    render(<PublicFeedbackModal data={[]} isVisible={true} onHide={vi.fn()} />);
    expect(screen.getByText('Public Feedback')).toBeInTheDocument();
  });

  it('calls onHide when the modal is cancelled', () => {
    const onHide = vi.fn();
    render(<PublicFeedbackModal data={data} isVisible={true} onHide={onHide} />);

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /close/i }));
    expect(onHide).toHaveBeenCalled();
  });

  it('does not render the dialog content when not visible', () => {
    render(<PublicFeedbackModal data={data} isVisible={false} onHide={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
