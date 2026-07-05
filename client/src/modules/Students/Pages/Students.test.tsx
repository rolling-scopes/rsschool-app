/* eslint-disable testing-library/no-node-access -- header cells are resolved via .closest('th') */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { message } from 'antd';
import { UserStudentDto } from '@client/api';
import { Students } from './Students';

// --- Boundary mocks --------------------------------------------------------

// AdminPageLayout pulls in Header + AdminSider (session/router heavy). Passthrough.
vi.mock('@client/shared/components/PageLayout', () => ({
  AdminPageLayout: ({ title, children }: { title: string; children: ReactNode }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@client/modules/Course/contexts', () => ({
  useActiveCourseContext: () => ({
    courses: [
      { id: 1, alias: 'ongoing-a', completed: false },
      { id: 3, alias: 'previous-a', completed: true },
    ],
  }),
}));

const { getUserStudents } = vi.hoisted(() => ({ getUserStudents: vi.fn() }));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  StudentsApi: function StudentsApi() {
    return { getUserStudents };
  },
}));

const students: UserStudentDto[] = [
  {
    id: 10,
    githubId: 'alice',
    fullName: 'Alice Smith',
    country: 'Poland' as never,
    city: 'Warsaw' as never,
    contactsEmail: 'alice@example.com',
    languages: ['en'],
    onGoingCourses: [{ alias: 'ongoing-a', hasCertificate: false, name: 'Ongoing A' }] as never,
    previousCourses: [] as never,
  } as UserStudentDto,
  {
    id: 20,
    githubId: 'bob',
    fullName: 'Bob Jones',
    country: 'Germany' as never,
    city: 'Berlin' as never,
    languages: ['de'],
    onGoingCourses: [] as never,
    previousCourses: [] as never,
  } as UserStudentDto,
];

const responseData = {
  content: students,
  pagination: { current: 1, pageSize: 20, total: 2, totalPages: 1 },
};

describe('<Students />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUserStudents.mockResolvedValue({ data: responseData });
  });

  it('fetches students on mount with the initial pagination and no filters', async () => {
    render(<Students />);

    await waitFor(() => expect(getUserStudents).toHaveBeenCalled());
    // (current, pageSize, student, country, city, ongoing, previous)
    expect(getUserStudents).toHaveBeenCalledWith('1', '20', undefined, undefined, undefined, undefined, undefined);
  });

  it('renders the fetched students in the table', async () => {
    render(<Students />);

    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /students list/i })).toBeInTheDocument();
  });

  it('opens the details drawer with the student info when a row is clicked', async () => {
    render(<Students />);
    await screen.findByText('Alice Smith');

    fireEvent.click(screen.getByText('Alice Smith'));

    // The Drawer renders into the body with the "Student Details" title.
    const drawerTitle = await screen.findByText('Student Details');
    expect(drawerTitle).toBeInTheDocument();
    // StudentInfo renders the selected student's location in the drawer.
    expect(await screen.findByText('Warsaw, Poland')).toBeInTheDocument();
  });

  it('closes the drawer when its close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Students />);
    await screen.findByText('Alice Smith');

    fireEvent.click(screen.getByText('Alice Smith'));
    await screen.findByText('Student Details');

    await user.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => expect(screen.queryByText('Warsaw, Poland')).not.toBeInTheDocument());
  });

  it('refetches with the country filter when a Country search is applied', async () => {
    const user = userEvent.setup();
    render(<Students />);
    await screen.findByText('Alice Smith');
    getUserStudents.mockClear();

    const countryHeader = screen.getAllByText('Country')[0]!.closest('th')!;
    await user.click(within(countryHeader).getByRole('button', { name: /search/i }));

    const input = await screen.findByPlaceholderText(/search country/i);
    await user.type(input, 'Poland');
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 });

    await waitFor(() => expect(getUserStudents).toHaveBeenCalled());
    // country is the 4th positional arg.
    const lastCall = getUserStudents.mock.calls.at(-1)!;
    expect(lastCall[3]).toBe('Poland');
  });

  it('refetches with the ongoing course filter when applied', async () => {
    const user = userEvent.setup();
    render(<Students />);
    await screen.findByText('Alice Smith');
    getUserStudents.mockClear();

    const ongoingHeader = screen.getAllByText('Ongoing Courses')[0]!.closest('th')!;
    await user.click(within(ongoingHeader).getByRole('button', { name: /filter/i }));

    const dropdown = await screen.findByRole('menu');
    await user.click(within(dropdown).getByText('ongoing-a'));
    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(getUserStudents).toHaveBeenCalled());
    // ongoingCourses is the 6th positional arg; filter value is the course id.
    const lastCall = getUserStudents.mock.calls.at(-1)!;
    expect(lastCall[5]).toBe('1');
  });

  it('shows an error message when the students request fails', async () => {
    const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as never);
    getUserStudents.mockRejectedValueOnce(new Error('boom'));
    render(<Students />);

    await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Failed to load students list. Please try again.'));
    errorSpy.mockRestore();
  });
});
