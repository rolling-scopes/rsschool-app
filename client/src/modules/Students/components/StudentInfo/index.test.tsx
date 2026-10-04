/* eslint-disable testing-library/no-node-access -- the github link is resolved via .closest('a') */
import { render, screen } from '@testing-library/react';
import { setupUser } from '@client/__tests__/setupUser';
import { UserStudentDto } from '@client/api';
import { StudentInfo } from './index';

function makeStudent(overrides: Partial<UserStudentDto> = {}): UserStudentDto {
  return {
    id: 1,
    githubId: 'alice',
    fullName: 'Alice Smith',
    country: 'Poland' as never,
    city: 'Warsaw' as never,
    contactsEmail: 'alice@example.com',
    contactsTelegram: '@alice',
    contactsLinkedIn: 'in/alice',
    contactsSkype: 'alice.skype',
    contactsPhone: '+48 123',
    discord: { username: 'alice#1' } as never,
    onGoingCourses: [{ alias: 'js', name: 'JS Course', hasCertificate: false, totalScore: 100, rank: 5 } as never],
    previousCourses: [
      {
        alias: 'rs',
        name: 'RS Course',
        hasCertificate: true,
        certificateId: 'cert-123',
        mentorGithubId: 'mentor1',
        mentorFullName: 'Mentor One',
        totalScore: 200,
        rank: 1,
      } as never,
    ],
    languages: ['en'],
    ...overrides,
  } as UserStudentDto;
}

describe('<StudentInfo />', () => {
  it('renders the student details, contacts and courses panels', () => {
    render(<StudentInfo student={makeStudent()} />);

    const nameLink = screen.getByRole('link', { name: 'Alice Smith' });
    expect(nameLink).toHaveAttribute('href', '/profile?githubId=alice');

    // The github handle renders inside a link to github.com.
    const ghLink = screen.getByText('alice').closest('a')!;
    expect(ghLink).toHaveAttribute('href', 'https://github.com/alice');
    expect(screen.getByText('Warsaw, Poland')).toBeInTheDocument();
    expect(screen.getByText('JS Course')).toBeInTheDocument();
    expect(screen.getByText('RS Course')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /certificate/i })).toHaveAttribute('href', '/certificate/cert-123');
    expect(screen.getByRole('link', { name: 'Mentor One' })).toHaveAttribute('href', '/profile?githubId=mentor1');
    expect(screen.getByText('Score: 100')).toBeInTheDocument();
    expect(screen.getByText('Score: 200')).toBeInTheDocument();
    expect(screen.getByText('Position: 1')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('omits an empty/placeholder full name', () => {
    render(<StudentInfo student={makeStudent({ fullName: '(Empty)', city: '' as never, country: '' as never })} />);

    expect(screen.queryByRole('link', { name: '(Empty)' })).not.toBeInTheDocument();
    // Github handle link still renders.
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('renders only the filled contacts in the Contacts panel', async () => {
    const user = setupUser();
    render(
      <StudentInfo
        student={makeStudent({
          contactsTelegram: '',
          contactsSkype: '',
          discord: undefined as never,
        })}
      />,
    );

    // The Contacts panel is collapsed by default (only Courses is open) — expand it.
    await user.click(screen.getByText('Contacts'));

    expect(await screen.findByText('Email')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    // Cleared contacts are dropped.
    expect(screen.queryByText('Telegram')).not.toBeInTheDocument();
    expect(screen.queryByText('Skype')).not.toBeInTheDocument();
    expect(screen.queryByText('Discord')).not.toBeInTheDocument();
  });

  it('sorts certified courses ahead of non-certified ones in the Courses list', () => {
    // Mixed certificate flags across both lists exercise both sides of the sort
    // comparator (course.hasCertificate ? -1 : 1).
    render(
      <StudentInfo
        student={makeStudent({
          previousCourses: [
            { alias: 'p1', name: 'Prev Certified', hasCertificate: true, totalScore: 10, rank: 2 } as never,
            { alias: 'p2', name: 'Prev Plain', hasCertificate: false, totalScore: 20, rank: 3 } as never,
          ],
          onGoingCourses: [
            { alias: 'o1', name: 'Cur Plain', hasCertificate: false, totalScore: 30, rank: 4 } as never,
            { alias: 'o2', name: 'Cur Certified', hasCertificate: true, totalScore: 40, rank: 5 } as never,
          ],
        })}
      />,
    );

    expect(screen.getByText('Prev Certified')).toBeInTheDocument();
    expect(screen.getByText('Cur Certified')).toBeInTheDocument();
    expect(screen.getByText('Prev Plain')).toBeInTheDocument();
    expect(screen.getByText('Cur Plain')).toBeInTheDocument();
  });
});
