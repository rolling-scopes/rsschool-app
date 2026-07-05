import { render, screen } from '@testing-library/react';
import HomeSummary from './HomeSummary';
import type { StudentSummaryDto } from '@client/api';

// GithubUserLink uses react-use's copy-to-clipboard hook; stub to a plain link.
vi.mock('@client/shared/components/GithubUserLink', () => ({
  GithubUserLink: ({ value }: { value: string }) => <a href={`/profile?githubId=${value}`}>{value}</a>,
}));

function makeSummary(overrides: Partial<StudentSummaryDto> = {}): StudentSummaryDto {
  return {
    totalScore: 120,
    isActive: true,
    rank: 3,
    results: [{ score: 10 } as any, { score: 0 } as any, { score: 5 } as any],
    mentor: null,
    ...overrides,
  } as StudentSummaryDto;
}

describe('<HomeSummary />', () => {
  it('renders nothing when there is no summary', () => {
    const { container } = render(<HomeSummary summary={null} courseTasks={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows score points and completed-task ratio (only positive scores count)', () => {
    render(<HomeSummary summary={makeSummary()} courseTasks={[{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]} />);
    expect(screen.getByText('Score Points')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    // 2 of 3 results have score > 0, total tasks = 4.
    expect(screen.getByText('2/4')).toBeInTheDocument();
  });

  it('shows an Active status when the student is active', () => {
    render(<HomeSummary summary={makeSummary({ isActive: true })} courseTasks={[]} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows an Inactive status when the student is inactive', () => {
    render(<HomeSummary summary={makeSummary({ isActive: false })} courseTasks={[]} />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('hides the mentor card when there is no mentor', () => {
    render(<HomeSummary summary={makeSummary({ mentor: null })} courseTasks={[]} />);
    expect(screen.queryByText('Your mentor')).not.toBeInTheDocument();
  });

  it('renders mentor name, github link and only the populated contacts', () => {
    const mentor = {
      name: 'Jane Mentor',
      githubId: 'jane',
      contactsEmail: 'jane@example.com',
      contactsPhone: null,
      contactsSkype: null,
      contactsTelegram: 'jane_tg',
      contactsNotes: null,
      contactsWhatsApp: null,
    };
    render(<HomeSummary summary={makeSummary({ mentor: mentor as any })} courseTasks={[]} />);

    expect(screen.getByText('Your mentor')).toBeInTheDocument();
    expect(screen.getByText('Jane Mentor')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'jane' })).toBeInTheDocument();
    // Populated contacts render; empty ones are skipped.
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane_tg')).toBeInTheDocument();
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.queryByText('Phone:')).not.toBeInTheDocument();
  });
});
