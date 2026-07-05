import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamDistributionStudentDto } from '@client/api';
import { StudentsTableColumnKey } from '@client/modules/Teams/constants';
import StudentsTable from './StudentsTable';

const students: TeamDistributionStudentDto[] = [
  {
    id: 1,
    fullName: 'Alice Lead',
    cvLink: '',
    discord: { id: 'd1', username: 'alice', discriminator: '0' } as never,
    telegram: 'alice_tg',
    email: 'alice@example.com',
    githubId: 'alice-gh',
    rank: 10,
    totalScore: 100,
    location: 'Minsk',
    cvUuid: 'uuid-alice',
  },
  {
    id: 2,
    fullName: 'Bob Member',
    cvLink: '',
    discord: null,
    telegram: 'bob_tg',
    email: 'bob@example.com',
    githubId: 'bob-gh',
    rank: 20,
    totalScore: 50,
    location: 'Grodno',
    cvUuid: '',
  },
];

describe('<StudentsTable />', () => {
  it('renders a row per student with name, github link and email', () => {
    render(<StudentsTable content={students} pagination={false} />);

    expect(screen.getByText('Alice Lead')).toBeInTheDocument();
    expect(screen.getByText('Bob Member')).toBeInTheDocument();

    const githubLink = screen.getByRole('link', { name: 'alice-gh' });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/alice-gh');
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('renders the name as a CV link only when the student has a cvUuid', () => {
    render(<StudentsTable content={students} pagination={false} />);

    const aliceLink = screen.getByRole('link', { name: /Alice Lead/i });
    expect(aliceLink).toHaveAttribute('href', expect.stringContaining('/cv/uuid-alice'));
    // Bob has no cvUuid -> plain text, not a link
    expect(screen.queryByRole('link', { name: /Bob Member/i })).not.toBeInTheDocument();
  });

  it('marks the team lead with a tag and renders the discord username link', () => {
    render(<StudentsTable content={students} pagination={false} teamLeadId={1} />);

    expect(screen.getByRole('link', { name: '@alice' })).toBeInTheDocument();
    // Bob has no discord -> "unknown"
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('hides columns passed via notVisibleColumn', () => {
    render(<StudentsTable content={students} pagination={false} notVisibleColumn={[StudentsTableColumnKey.Email]} />);

    expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument();
  });

  it('does not render a delete column when onDelete is not provided', () => {
    render(<StudentsTable content={students} pagination={false} />);
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
  });

  it('renders the combined mobile student/contacts columns on an xs viewport', () => {
    // antd marks the Student/Contacts columns responsive to the `xs` breakpoint only.
    // Force a narrow viewport so those mobile renderers are exercised.
    window.innerWidth = 360;
    window.dispatchEvent(new Event('resize'));

    render(<StudentsTable content={students} pagination={false} teamLeadId={1} />);

    // mobile "Student" column stacks name + location + rank
    expect(screen.getAllByText('Minsk').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/rank:/i).length).toBeGreaterThan(0);
    // mobile "Contacts" column stacks discord + email
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();

    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));
  });

  it('renders delete buttons and calls onDelete with the student when clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<StudentsTable content={students} pagination={false} onDelete={onDelete} />);

    // One delete button per student, rendered in row order.
    const deleteButtons = screen.getAllByRole('button', { name: 'delete' });
    expect(deleteButtons).toHaveLength(students.length);
    await user.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(students[0]);
  });
});
