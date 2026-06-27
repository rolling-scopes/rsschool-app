/* eslint-disable testing-library/no-node-access -- header cells are resolved via .closest('th') */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseDto, UserStudentDto } from '@client/api';
import StudentsTable from './index';

// next/config is aliased to a stub in the vitest config; GithubUserLink pulls in
// @client/hooks (aliased) and react-use — both run fine in jsdom. No extra mocks.

const courses = [
  { id: 1, alias: 'ongoing-a', completed: false },
  { id: 2, alias: 'ongoing-b', completed: false },
  { id: 3, alias: 'previous-a', completed: true },
] as CourseDto[];

const students: UserStudentDto[] = [
  {
    id: 10,
    githubId: 'alice',
    fullName: 'Alice Smith',
    country: 'Poland' as never,
    city: 'Warsaw' as never,
    languages: ['en', 'pl'],
    onGoingCourses: [{ alias: 'ongoing-a', hasCertificate: false }] as never,
    previousCourses: [{ alias: 'previous-a', hasCertificate: true }] as never,
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

function makeProps(overrides: Partial<Parameters<typeof StudentsTable>[0]> = {}) {
  return {
    content: students,
    pagination: { current: 1, pageSize: 20, total: 2 },
    handleChange: vi.fn(),
    loading: false,
    courses,
    setActiveStudent: vi.fn(),
    ...overrides,
  } as Parameters<typeof StudentsTable>[0];
}

describe('<StudentsTable />', () => {
  beforeEach(() => vi.clearAllMocks());

  // With scroll={{ y }} antd renders a duplicate (sticky) header, so each column
  // title text appears more than once. Resolve a header cell by title text.
  function headerCell(title: string) {
    return screen.getAllByText(title)[0]!.closest('th')!;
  }

  it('renders the column headers', () => {
    render(<StudentsTable {...makeProps()} />);

    ['Student', 'Ongoing Courses', 'Previous Courses', 'Country', 'City', 'Languages'].forEach(title => {
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    });
  });

  it('renders a row per student with names, locations and language tags', () => {
    render(<StudentsTable {...makeProps()} />);

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('Warsaw')).toBeInTheDocument();
    expect(screen.getByText('Berlin')).toBeInTheDocument();
    expect(screen.getByText('Poland')).toBeInTheDocument();
    expect(screen.getByText('pl')).toBeInTheDocument();
    expect(screen.getByText('de')).toBeInTheDocument();
  });

  it('renders the course aliases as tags', () => {
    render(<StudentsTable {...makeProps()} />);

    expect(screen.getByText('ongoing-a')).toBeInTheDocument();
    expect(screen.getByText('previous-a')).toBeInTheDocument();
  });

  it('collapses more than three courses into a "+N more" overflow tag', () => {
    const manyCourses = [
      { alias: 'c1', hasCertificate: false },
      { alias: 'c2', hasCertificate: true },
      { alias: 'c3', hasCertificate: false },
      { alias: 'c4', hasCertificate: true }, // hidden + certified
      { alias: 'c5', hasCertificate: false }, // hidden, not certified
    ] as never;
    const student = {
      ...students[0],
      id: 99,
      onGoingCourses: manyCourses,
    } as UserStudentDto;

    render(<StudentsTable {...makeProps({ content: [student] })} />);

    // First three render directly.
    expect(screen.getByText('c1')).toBeInTheDocument();
    expect(screen.getByText('c2')).toBeInTheDocument();
    expect(screen.getByText('c3')).toBeInTheDocument();
    // The remaining two collapse into a "+2 more" overflow tag.
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('renders the overflow tag without the certified color when no hidden course is certified', () => {
    const manyCourses = [
      { alias: 'd1', hasCertificate: false },
      { alias: 'd2', hasCertificate: false },
      { alias: 'd3', hasCertificate: false },
      { alias: 'd4', hasCertificate: false }, // hidden, none certified
    ] as never;
    const student = {
      ...students[0],
      id: 98,
      onGoingCourses: manyCourses,
    } as UserStudentDto;

    render(<StudentsTable {...makeProps({ content: [student] })} />);

    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('calls setActiveStudent with the record when a row is clicked', async () => {
    const props = makeProps();
    render(<StudentsTable {...props} />);

    // Click the cell text of the first data row.
    fireEvent.click(screen.getByText('Alice Smith'));

    expect(props.setActiveStudent).toHaveBeenCalledWith(students[0]);
  });

  it('renders the empty placeholder when there is no content', () => {
    render(<StudentsTable {...makeProps({ content: [] })} />);

    expect(screen.getAllByText(/no data/i).length).toBeGreaterThan(0);
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
  });

  it('shows only ongoing (not completed) courses in the Ongoing Courses filter list', async () => {
    const user = userEvent.setup();
    render(<StudentsTable {...makeProps()} />);

    // The Ongoing Courses column has a server-side `filters` dropdown.
    const ongoingHeader = headerCell('Ongoing Courses');
    const filterBtn = within(ongoingHeader).getByRole('button', { name: /filter/i });
    await user.click(filterBtn);

    const dropdown = await screen.findByRole('menu');
    expect(within(dropdown).getByText('ongoing-a')).toBeInTheDocument();
    expect(within(dropdown).getByText('ongoing-b')).toBeInTheDocument();
    // Completed courses must NOT appear in the ongoing filter.
    expect(within(dropdown).queryByText('previous-a')).not.toBeInTheDocument();
  });

  it('passes the selected ongoing course id to handleChange when its filter is applied', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<StudentsTable {...props} />);

    const ongoingHeader = headerCell('Ongoing Courses');
    await user.click(within(ongoingHeader).getByRole('button', { name: /filter/i }));

    const dropdown = await screen.findByRole('menu');
    await user.click(within(dropdown).getByText('ongoing-a'));
    await user.click(screen.getByRole('button', { name: /ok/i }));

    await waitFor(() => expect(props.handleChange).toHaveBeenCalled());
    // antd onChange signature: (pagination, filters, sorter, extra)
    const [, filters] = props.handleChange.mock.calls.at(-1)!;
    expect(filters.onGoingCourses).toEqual([1]);
  });

  it('passes the typed Country search value to handleChange', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<StudentsTable {...props} />);

    // The Country column uses a search-input filter dropdown.
    const countryHeader = headerCell('Country');
    await user.click(within(countryHeader).getByRole('button', { name: /search/i }));

    const searchInput = await screen.findByPlaceholderText(/search country/i);
    await user.type(searchInput, 'Poland');
    fireEvent.keyDown(searchInput, { key: 'Enter', keyCode: 13 });

    await waitFor(() => expect(props.handleChange).toHaveBeenCalled());
    const [, filters] = props.handleChange.mock.calls.at(-1)!;
    expect(filters.country).toEqual(['Poland']);
  });

  it('passes the typed City search value to handleChange', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<StudentsTable {...props} />);

    const cityHeader = headerCell('City');
    await user.click(within(cityHeader).getByRole('button', { name: /search/i }));

    const searchInput = await screen.findByPlaceholderText(/search city/i);
    await user.type(searchInput, 'Berlin');
    fireEvent.keyDown(searchInput, { key: 'Enter', keyCode: 13 });

    await waitFor(() => expect(props.handleChange).toHaveBeenCalled());
    const [, filters] = props.handleChange.mock.calls.at(-1)!;
    expect(filters.city).toEqual(['Berlin']);
  });

  it('passes the typed Student search value to handleChange', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<StudentsTable {...props} />);

    const studentHeader = headerCell('Student');
    await user.click(within(studentHeader).getByRole('button', { name: /search/i }));

    const searchInput = await screen.findByPlaceholderText(/search student/i);
    await user.type(searchInput, 'alice');
    fireEvent.keyDown(searchInput, { key: 'Enter', keyCode: 13 });

    await waitFor(() => expect(props.handleChange).toHaveBeenCalled());
    const [, filters] = props.handleChange.mock.calls.at(-1)!;
    expect(filters.student).toEqual(['alice']);
  });
});
