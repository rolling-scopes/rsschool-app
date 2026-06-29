/* eslint-disable testing-library/no-node-access */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseModal } from './index';

// --- Boundary mocks --------------------------------------------------------

// Brittle-widget policy: antd DatePicker / DatePicker.RangePicker are CPU-heavy in jsdom
// (they intermittently push this file past the 60s timeout under parallel coverage).
// Replace ONLY the pickers with minimal controlled stubs that preserve value/onChange and
// emit real dayjs values (createRecord calls dayjs.utc(...).format() on them). Every other
// antd component stays real. Form.Item injects value/onChange via cloneElement.
vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  const dj = (await vi.importActual<typeof import('dayjs')>('dayjs')).default;

  type DateValue = ReturnType<typeof dj> | null;

  const DatePicker = (props: {
    value?: DateValue;
    onChange?: (d: DateValue, s: string) => void;
    placeholder?: string;
  }) => (
    <input
      data-testid="datepicker"
      placeholder={props.placeholder}
      value={props.value ? props.value.format('YYYY-MM-DD') : ''}
      onChange={e => {
        const v = e.target.value;
        props.onChange?.(v ? dj.utc(v) : null, v);
      }}
    />
  );

  const RangePicker = (props: {
    value?: [DateValue, DateValue] | null;
    onChange?: (d: [DateValue, DateValue] | null, s: [string, string]) => void;
  }) => {
    const [start, end] = props.value ?? [null, null];
    const emit = (s: DateValue, e: DateValue) =>
      props.onChange?.([s, e], [s ? s.format('YYYY-MM-DD') : '', e ? e.format('YYYY-MM-DD') : '']);
    return (
      <span data-testid="rangepicker">
        <input
          data-testid="range-start"
          value={start ? start.format('YYYY-MM-DD') : ''}
          onChange={e => emit(e.target.value ? dj.utc(e.target.value) : null, end)}
        />
        <input
          data-testid="range-end"
          value={end ? end.format('YYYY-MM-DD') : ''}
          onChange={e => emit(start, e.target.value ? dj.utc(e.target.value) : null)}
        />
      </span>
    );
  };
  DatePicker.RangePicker = RangePicker;

  return { ...actual, DatePicker };
});

// Generated CoursesApi: getCourse (edit prefill) + create/update/copy on submit.
const { getCourse, createCourse, updateCourse, copyCourse } = vi.hoisted(() => ({
  getCourse: vi.fn(),
  createCourse: vi.fn(),
  updateCourse: vi.fn(),
  copyCourse: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  CoursesApi: function CoursesApi() {
    return { getCourse, createCourse, updateCourse, copyCourse };
  },
}));

const disciplines = [
  { id: 11, name: 'Frontend' },
  { id: 22, name: 'Backend' },
];
const discordServers = [{ id: 5, name: 'RS Discord' }];
const courses = [
  { id: 100, name: 'Existing Course A' },
  { id: 200, name: 'Existing Course B' },
] as never;

function makeProps(overrides: Partial<Parameters<typeof CourseModal>[0]> = {}) {
  return {
    onClose: vi.fn(),
    discordServers,
    disciplines,
    courses,
    courseId: null,
    ...overrides,
  } as Parameters<typeof CourseModal>[0];
}

const editCourse = {
  id: 7,
  name: 'JS Course',
  fullName: 'JavaScript Course',
  alias: 'js-2024',
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-06-01T00:00:00.000Z',
  discordServerId: 5,
  disciplineId: 11,
  discipline: { id: 11 },
  certificateThreshold: 70,
  minStudentsPerMentor: 2,
  descriptionUrl: 'https://rs.school/courses/javascript',
  certificateDisciplines: null,
  completed: false,
  planned: false,
  inviteOnly: false,
};

describe('<CourseModal />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCourse.mockResolvedValue({ data: editCourse });
    createCourse.mockResolvedValue({});
    updateCourse.mockResolvedValue({});
    copyCourse.mockResolvedValue({});
  });

  it('renders the "Add Course" title and the copy-template select when creating', async () => {
    render(<CourseModal {...makeProps()} />);

    expect(await screen.findByText('Add Course')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy Tasks, Schedule from:')).toBeInTheDocument();
  });

  it('renders the "Edit Course" title and hides the copy-template select when editing', async () => {
    render(<CourseModal {...makeProps({ courseId: 7 })} />);

    expect(await screen.findByText('Edit Course')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('JS Course')).toBeInTheDocument();
    expect(screen.queryByLabelText('Copy Tasks, Schedule from:')).not.toBeInTheDocument();
  });

  it('fetches the course when editing', async () => {
    render(<CourseModal {...makeProps({ courseId: 7 })} />);

    await waitFor(() => expect(getCourse).toHaveBeenCalledWith(7));
  });

  it('renders the core required fields', async () => {
    render(<CourseModal {...makeProps()} />);

    expect(await screen.findByLabelText('Course Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Course Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Alias')).toBeInTheDocument();
    expect(screen.getByLabelText('Discord/Telegram channel')).toBeInTheDocument();
    expect(screen.getByLabelText('Disciplines')).toBeInTheDocument();
  });

  it('shows validation errors and does not submit when required fields are empty', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CourseModal {...props} />);

    await screen.findByText('Add Course');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Please enter name')).toBeInTheDocument();
    expect(screen.getByText('Please enter full name')).toBeInTheDocument();
    expect(screen.getByText('Please enter alias')).toBeInTheDocument();
    expect(createCourse).not.toHaveBeenCalled();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('reveals the Custom Url input when "Custom" description URL is selected', async () => {
    render(<CourseModal {...makeProps()} />);

    // The Description Url dropdown is long and virtualized (only ~10 options render at a
    // time); scroll the rc-virtual list so the trailing "Custom" option mounts.
    const descUrlSelect = await screen.findByLabelText('Description Url');
    fireEvent.mouseDown(descUrlSelect);

    await waitFor(() => expect(document.querySelector('.rc-virtual-list-holder')).toBeTruthy());
    const list = document.querySelector('.rc-virtual-list-holder')!;
    fireEvent.scroll(list, { target: { scrollTop: 1000 } });

    const customOption = await within(document.body).findByText('Custom');
    fireEvent.click(customOption);

    expect(await screen.findByLabelText('Custom Url')).toBeInTheDocument();
  });

  it('hides the certificate disciplines select when "Any course" is checked', async () => {
    const user = userEvent.setup();
    render(<CourseModal {...makeProps()} />);

    await screen.findByText('Add Course');
    // The multiple-select renders its placeholder as a text node (not an input placeholder attr).
    const disciplinesPlaceholder = screen.getByText('Select disciplines');
    // Its Form.Item wrapper is visible initially (not hidden).
    expect(disciplinesPlaceholder.closest('.ant-form-item-hidden')).toBeNull();

    await user.click(screen.getByRole('checkbox', { name: /any course/i }));

    // antd's Form.Item `hidden` keeps the node in the DOM but applies display:none via
    // the `ant-form-item-hidden` class — assert it becomes hidden.
    await waitFor(() => {
      expect(screen.getByText('Select disciplines').closest('.ant-form-item-hidden')).not.toBeNull();
    });
  });

  it('reveals the Personal Mentoring date range when the toggle is checked', async () => {
    const user = userEvent.setup();
    render(<CourseModal {...makeProps()} />);

    await screen.findByText('Add Course');
    expect(screen.queryByText('Personal Mentoring Dates')).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /personal mentoring/i }));

    expect(await screen.findByText('Personal Mentoring Dates')).toBeInTheDocument();
  });

  it('rejects an invalid WeAreCommunity/registry URL', async () => {
    render(<CourseModal {...makeProps()} />);

    const urlInput = await screen.findByPlaceholderText('Enter URL');
    fireEvent.change(urlInput, { target: { value: 'http://evil.example.com' } });

    expect(await screen.findByText('Please enter RS APP or wearecommunity.io URL')).toBeInTheDocument();
  });

  it('rejects a registry URL whose course alias does not match the entered alias', async () => {
    render(<CourseModal {...makeProps()} />);

    const alias = await screen.findByLabelText('Alias');
    fireEvent.change(alias, { target: { value: 'my-course' } });
    // Wait for the watched alias to propagate (the live registry-link preview confirms it).
    await screen.findByText('https://app.rs.school/registry/student?course=my-course');

    const urlInput = screen.getByPlaceholderText('Enter URL');
    // A valid registry URL but with a different course alias → alias-mismatch rejection.
    fireEvent.change(urlInput, { target: { value: 'https://app.rs.school/registry/student?course=other-course' } });

    expect(await screen.findByText('URL must end with my-course')).toBeInTheDocument();
  });

  it('accepts a registry URL whose course alias matches the entered alias', async () => {
    render(<CourseModal {...makeProps()} />);

    const alias = await screen.findByLabelText('Alias');
    fireEvent.change(alias, { target: { value: 'my-course' } });
    await screen.findByText('https://app.rs.school/registry/student?course=my-course');

    const urlInput = screen.getByPlaceholderText('Enter URL');
    fireEvent.change(urlInput, { target: { value: 'https://app.rs.school/registry/student?course=my-course' } });

    // No mismatch error should appear for a matching alias.
    await waitFor(() => {
      expect(screen.queryByText('URL must end with my-course')).not.toBeInTheDocument();
      expect(screen.queryByText('Please enter RS APP or wearecommunity.io URL')).not.toBeInTheDocument();
    });
  });

  it('shows the RS APP registry link preview once an alias is entered', async () => {
    render(<CourseModal {...makeProps()} />);

    const alias = await screen.findByLabelText('Alias');
    fireEvent.change(alias, { target: { value: 'my-course' } });

    expect(await screen.findByText('https://app.rs.school/registry/student?course=my-course')).toBeInTheDocument();
  });

  it('updates the course with the built record when editing and saving', async () => {
    const user = userEvent.setup();
    const props = makeProps({ courseId: 7 });
    render(<CourseModal {...props} />);

    // Wait for the edit form to prefill (range is seeded from start/end dates).
    expect(await screen.findByDisplayValue('JS Course')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(updateCourse).toHaveBeenCalled());
    const [id, record] = updateCourse.mock.calls[0];
    expect(id).toBe(7);
    expect(record).toMatchObject({
      name: 'JS Course',
      fullName: 'JavaScript Course',
      alias: 'js-2024',
      certificateThreshold: 70,
      minStudentsPerMentor: 2,
    });
    await waitFor(() => expect(props.onClose).toHaveBeenCalled());
  });

  it('marks the course completed when the Completed state radio is chosen on save', async () => {
    const user = userEvent.setup();
    const props = makeProps({ courseId: 7 });
    render(<CourseModal {...props} />);

    expect(await screen.findByDisplayValue('JS Course')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /completed/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(updateCourse).toHaveBeenCalled());
    const [, record] = updateCourse.mock.calls[0];
    expect(record.completed).toBe(true);
    expect(record.planned).toBe(false);
  });

  // Fill the create form's required fields (text, selects, and the RangePicker via its
  // two date input cells). Returns nothing; the form is left valid and ready to submit.
  async function fillCreateForm() {
    fireEvent.change(screen.getByLabelText('Course Name'), { target: { value: 'New Course' } });
    fireEvent.change(screen.getByLabelText('Full Course Name'), { target: { value: 'New Full Course' } });
    fireEvent.change(screen.getByLabelText('Alias'), { target: { value: 'newc' } });

    const discord = screen.getByLabelText('Discord/Telegram channel');
    fireEvent.mouseDown(discord);
    fireEvent.click(await within(document.body).findByText('RS Discord'));

    const disc = screen.getByLabelText('Disciplines');
    fireEvent.mouseDown(disc);
    const fe = await within(document.body).findAllByText('Frontend');
    fireEvent.click(fe[fe.length - 1]);

    const descUrl = screen.getByLabelText('Description Url');
    fireEvent.mouseDown(descUrl);
    fireEvent.click(await within(document.body).findByText('JavaScript'));

    // Start - End Date RangePicker (the only range picker visible in the create form):
    // set start/end through the stubbed inputs, which emit dayjs values to the form.
    fireEvent.change(screen.getByTestId('range-start'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByTestId('range-end'), { target: { value: '2024-06-01' } });
  }

  it('creates a new course with the built record when the create form is submitted', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CourseModal {...props} />);

    await screen.findByText('Add Course');
    await fillCreateForm();

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(createCourse).toHaveBeenCalled());
    const [record] = createCourse.mock.calls[0];
    expect(record).toMatchObject({
      name: 'New Course',
      fullName: 'New Full Course',
      alias: 'newc',
      disciplineId: 11,
      discordServerId: 5,
      descriptionUrl: 'https://rs.school/courses/javascript',
    });
    expect(copyCourse).not.toHaveBeenCalled();
    await waitFor(() => expect(props.onClose).toHaveBeenCalled());
  });

  it('copies tasks/schedule from a template course when one is chosen on create', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CourseModal {...props} />);

    await screen.findByText('Add Course');
    await fillCreateForm();

    // Choose a template course → submit routes through copyCourse(templateId, record).
    const copyFrom = screen.getByLabelText('Copy Tasks, Schedule from:');
    fireEvent.mouseDown(copyFrom);
    fireEvent.click(await within(document.body).findByText('Existing Course A'));

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(copyCourse).toHaveBeenCalled());
    const [templateId, record] = copyCourse.mock.calls[0];
    expect(templateId).toBe(100);
    expect(record).toMatchObject({ name: 'New Course', alias: 'newc' });
    expect(createCourse).not.toHaveBeenCalled();
    await waitFor(() => expect(props.onClose).toHaveBeenCalled());
  });

  it('calls onClose when the modal cancel button is clicked', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CourseModal {...props} />);

    await screen.findByText('Add Course');
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(props.onClose).toHaveBeenCalled();
  });

  it('prefills and rebuilds a richly-populated planned course (registration date, certificates, mentoring, WAC URL)', async () => {
    const user = userEvent.setup();
    getCourse.mockResolvedValue({
      data: {
        ...editCourse,
        planned: true,
        completed: false,
        registrationEndDate: '2024-02-01T00:00:00.000Z',
        certificateDisciplines: [11, 22],
        personalMentoring: true,
        personalMentoringStartDate: '2024-03-01T00:00:00.000Z',
        personalMentoringEndDate: '2024-04-01T00:00:00.000Z',
        wearecommunityUrl: 'https://wearecommunity.io/events/some-event',
      },
    });
    const props = makeProps({ courseId: 7 });
    render(<CourseModal {...props} />);

    expect(await screen.findByDisplayValue('JS Course')).toBeInTheDocument();
    // Planned state radio is preselected from getInitialValues.
    expect((screen.getByRole('radio', { name: /planned/i }) as HTMLInputElement).checked).toBe(true);

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(updateCourse).toHaveBeenCalled());
    const [, record] = updateCourse.mock.calls[0];
    expect(record.planned).toBe(true);
    expect(record.completed).toBe(false);
    expect(record.registrationEndDate).not.toBeNull();
    // certificateDisciplines present + anyCertificate false => mapped to strings
    expect(record.certificateDisciplines).toEqual(['11', '22']);
    expect(record.personalMentoring).toBe(true);
    expect(record.personalMentoringStartDate).not.toBeNull();
    // explicit wearecommunityUrl is kept (the `||` left side)
    expect(record.wearecommunityUrl).toBe('https://wearecommunity.io/events/some-event');
  });

  it('treats an empty certificateDisciplines list as "Any course" and clears the list on save', async () => {
    const user = userEvent.setup();
    getCourse.mockResolvedValue({
      data: { ...editCourse, certificateDisciplines: [] },
    });
    const props = makeProps({ courseId: 7 });
    render(<CourseModal {...props} />);

    expect(await screen.findByDisplayValue('JS Course')).toBeInTheDocument();
    // anyCertificate is derived as true when the saved list is empty.
    expect((screen.getByRole('checkbox', { name: /any course/i }) as HTMLInputElement).checked).toBe(true);

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(updateCourse).toHaveBeenCalled());
    const [, record] = updateCourse.mock.calls[0];
    // anyCertificate => certificateDisciplines becomes []
    expect(record.certificateDisciplines).toEqual([]);
  });

  it('falls back to the RS APP registry URL when no WeAreCommunity URL is provided', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CourseModal {...props} />);

    await screen.findByText('Add Course');
    await fillCreateForm();
    // leave the WeAreCommunity URL empty => createRecord uses buildRSAppStudentRegistryURL(alias)

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(createCourse).toHaveBeenCalled());
    const [record] = createCourse.mock.calls[0];
    expect(record.wearecommunityUrl).toBe('https://app.rs.school/registry/student?course=newc');
  });

  it('submits the custom description URL when "Custom" is selected', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CourseModal {...props} />);

    await screen.findByText('Add Course');

    // Fill required text + selects, but pick "Custom" for the description URL.
    fireEvent.change(screen.getByLabelText('Course Name'), { target: { value: 'New Course' } });
    fireEvent.change(screen.getByLabelText('Full Course Name'), { target: { value: 'New Full Course' } });
    fireEvent.change(screen.getByLabelText('Alias'), { target: { value: 'newc' } });

    const discord = screen.getByLabelText('Discord/Telegram channel');
    fireEvent.mouseDown(discord);
    fireEvent.click(await within(document.body).findByText('RS Discord'));

    const disc = screen.getByLabelText('Disciplines');
    fireEvent.mouseDown(disc);
    const fe = await within(document.body).findAllByText('Frontend');
    fireEvent.click(fe[fe.length - 1]);

    fireEvent.change(screen.getByTestId('range-start'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByTestId('range-end'), { target: { value: '2024-06-01' } });

    // Close any dropdown left open by the previous selects so descUrl's list is the only one.
    fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });

    // Description URL -> "Custom" (scroll the virtualized list so the trailing option mounts).
    const descUrlSelect = screen.getByLabelText('Description Url');
    fireEvent.mouseDown(descUrlSelect);
    await waitFor(() => expect(document.querySelectorAll('.rc-virtual-list-holder').length).toBeGreaterThan(0));
    const holders = document.querySelectorAll('.rc-virtual-list-holder');
    const holder = holders[holders.length - 1];
    fireEvent.scroll(holder, { target: { scrollTop: 2000 } });
    fireEvent.click(await within(document.body).findByText('Custom'));

    const customUrl = await screen.findByLabelText('Custom Url');
    fireEvent.change(customUrl, { target: { value: 'https://example.com/custom-course' } });

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(createCourse).toHaveBeenCalled());
    const [record] = createCourse.mock.calls[0];
    expect(record.descriptionUrl).toBe('https://example.com/custom-course');
  });

  it('seeds an empty date range when the edited course has no start/end dates', async () => {
    getCourse.mockResolvedValue({
      data: { ...editCourse, startDate: undefined, endDate: undefined },
    });
    render(<CourseModal {...makeProps({ courseId: 7 })} />);

    // getDateRange returns null (no dates) => the RangePicker renders empty.
    expect(await screen.findByDisplayValue('JS Course')).toBeInTheDocument();
    expect(screen.getByTestId('range-start')).toHaveValue('');
  });
});
