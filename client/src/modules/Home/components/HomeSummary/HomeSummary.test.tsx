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
  it('renders summary status, score, and optional mentor details', () => {
    const { container, rerender } = render(<HomeSummary summary={null} courseTasks={[]} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<HomeSummary summary={makeSummary()} courseTasks={[{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]} />);
    expect(screen.getByText('Score Points')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('2/4')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.queryByText('Your mentor')).not.toBeInTheDocument();

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
    rerender(<HomeSummary summary={makeSummary({ isActive: false, mentor: mentor as any })} courseTasks={[]} />);

    expect(screen.getByText('Inactive')).toBeInTheDocument();
    expect(screen.getByText('Your mentor')).toBeInTheDocument();
    expect(screen.getByText('Jane Mentor')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'jane' })).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane_tg')).toBeInTheDocument();
    expect(screen.getByText('Email:')).toBeInTheDocument();
    expect(screen.queryByText('Phone:')).not.toBeInTheDocument();
  });
});
