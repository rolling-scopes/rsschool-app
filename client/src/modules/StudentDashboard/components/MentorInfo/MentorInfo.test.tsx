import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MentorStudentSummaryDto } from '@client/api';
import MentorInfo from './MentorInfo';

// GithubAvatar pulls in image/network logic; replace with a marker.
vi.mock('@client/shared/components/GithubAvatar', () => ({
  GithubAvatar: ({ githubId }: { githubId?: string }) => <div data-testid="avatar">{githubId}</div>,
}));

function makeMentor(overrides: Partial<MentorStudentSummaryDto> = {}): MentorStudentSummaryDto {
  return {
    id: 1,
    name: 'Mentor Name',
    githubId: 'mentor-gh',
    cityName: 'Minsk',
    countryName: 'Belarus',
    contactsEmail: 'mentor@example.com',
    contactsTelegram: 'mentor_tg',
    contactsPhone: '+100',
    contactsSkype: 'mentor.skype',
    contactsNotes: 'some notes',
    ...overrides,
  } as MentorStudentSummaryDto;
}

describe('<MentorInfo />', () => {
  it('renders the mentor name, github link to the profile, and location', () => {
    render(<MentorInfo mentor={makeMentor()} />);

    expect(screen.getByText('Mentor Name')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /mentor-gh/ });
    expect(link).toHaveAttribute('href', 'https://github.com/mentor-gh');
    expect(link).toHaveAttribute('target', '_blank');

    expect(screen.getByText('Minsk, Belarus')).toBeInTheDocument();
  });

  it('renders every populated contact row', () => {
    render(<MentorInfo mentor={makeMentor()} />);

    expect(screen.getByText('E-mail:')).toBeInTheDocument();
    expect(screen.getByText('mentor@example.com')).toBeInTheDocument();
    expect(screen.getByText('Telegram:')).toBeInTheDocument();
    expect(screen.getByText('mentor_tg')).toBeInTheDocument();
    expect(screen.getByText('Phone:')).toBeInTheDocument();
    expect(screen.getByText('Skype:')).toBeInTheDocument();
    expect(screen.getByText('Notes:')).toBeInTheDocument();
    expect(screen.getByText('some notes')).toBeInTheDocument();
  });

  it('omits contact rows and the name when those values are missing', () => {
    render(
      <MentorInfo
        mentor={makeMentor({
          name: undefined,
          contactsEmail: undefined,
          contactsTelegram: undefined,
          contactsPhone: undefined,
          contactsSkype: undefined,
          contactsNotes: undefined,
        })}
      />,
    );

    expect(screen.queryByText('Mentor Name')).not.toBeInTheDocument();
    expect(screen.queryByText('E-mail:')).not.toBeInTheDocument();
    expect(screen.queryByText('Notes:')).not.toBeInTheDocument();
    // github link still rendered
    expect(screen.getByRole('link', { name: /mentor-gh/ })).toBeInTheDocument();
  });
});
