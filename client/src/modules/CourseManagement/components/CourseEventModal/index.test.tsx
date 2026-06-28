import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseEventModal } from './index';

// --- Boundary mocks --------------------------------------------------------

// Brittle-widget policy: antd DatePicker is CPU-heavy in jsdom. This modal only renders
// the date/time pickers (their dayjs values are seeded by getInitialValues and never
// driven by these tests), so replace the picker with a minimal controlled stub that
// preserves value/onChange. Every other antd component stays real.
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
      value={props.value ? props.value.format('YYYY-MM-DD HH:mm') : ''}
      onChange={e => {
        const v = e.target.value;
        props.onChange?.(v ? dj.utc(v) : null, v);
      }}
    />
  );
  DatePicker.RangePicker = (props: {
    value?: [DateValue, DateValue] | null;
    onChange?: (d: [DateValue, DateValue] | null) => void;
  }) => {
    const [start, end] = props.value ?? [null, null];
    return (
      <span data-testid="rangepicker">
        <input
          data-testid="range-start"
          value={start ? start.format('YYYY-MM-DD') : ''}
          onChange={e => props.onChange?.([e.target.value ? dj.utc(e.target.value) : null, end])}
        />
        <input
          data-testid="range-end"
          value={end ? end.format('YYYY-MM-DD') : ''}
          onChange={e => props.onChange?.([start, e.target.value ? dj.utc(e.target.value) : null])}
        />
      </span>
    );
  };

  return { ...actual, DatePicker };
});

// Generated EventsApi / DisciplinesApi: loaded in parallel on mount.
const { getEvents, getDisciplines } = vi.hoisted(() => ({
  getEvents: vi.fn(),
  getDisciplines: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  EventsApi: function EventsApi() {
    return { getEvents };
  },
  DisciplinesApi: function DisciplinesApi() {
    return { getDisciplines };
  },
}));

// formState.submitEvent does the real API persistence. Mock it so we assert the modal
// hands off the form values + course/events context, while keeping real getInitialValues.
const { submitEvent } = vi.hoisted(() => ({ submitEvent: vi.fn() }));
vi.mock('./formState', async () => ({
  ...(await vi.importActual('./formState')),
  submitEvent,
}));

// UserService backs UserSearch remote search.
vi.mock('@client/services/user', () => ({
  UserService: function UserService() {
    return { searchUser: vi.fn().mockResolvedValue([]) };
  },
}));

// UserSearch is a remote Select (brittle) → controlled stub preserving value/onChange.
// It also invokes the passed searchFn so the modal's loadUsers handler is exercised.
vi.mock('@client/shared/components/UserSearch', () => ({
  UserSearch: (props: {
    value?: number;
    onChange?: (v: number) => void;
    searchFn?: (text: string) => Promise<unknown>;
  }) => (
    <input
      data-testid="task-owner"
      value={props.value ?? ''}
      onChange={e => {
        props.onChange?.(Number(e.target.value));
        props.searchFn?.(e.target.value);
      }}
    />
  ),
}));

const events = [
  {
    id: 1,
    name: 'Intro Lecture',
    type: 'lecture_online',
    description: 'desc',
    descriptionUrl: 'https://example.com/intro',
  },
  { id: 2, name: 'Workshop', type: 'workshop', description: '', descriptionUrl: '' },
];
const disciplines = [
  { id: 11, name: 'Frontend' },
  { id: 22, name: 'Backend' },
];

function makeProps(overrides: Partial<Parameters<typeof CourseEventModal>[0]> = {}) {
  return {
    data: {} as Parameters<typeof CourseEventModal>[0]['data'],
    courseId: 99,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
}

describe('<CourseEventModal />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getEvents.mockResolvedValue({ data: events });
    getDisciplines.mockResolvedValue({ data: disciplines });
    submitEvent.mockResolvedValue(undefined);
  });

  it('renders the modal with the event/type/discipline fields when adding a new event', async () => {
    render(<CourseEventModal {...makeProps()} />);

    expect(await screen.findByText('Course Event')).toBeInTheDocument();
    expect(screen.getByLabelText('Event')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Discipline')).toBeInTheDocument();
    expect(screen.getByLabelText('Description URL')).toBeInTheDocument();
  });

  it('renders the event name as a title (no Event select) when editing an existing event', async () => {
    render(<CourseEventModal {...makeProps({ data: { event: { id: 5, name: 'Existing Event' } } as never })} />);

    expect(await screen.findByText('Existing Event')).toBeInTheDocument();
    // In edit mode the Event select is replaced by the title.
    expect(screen.queryByLabelText('Event')).not.toBeInTheDocument();
  });

  it('lists fetched disciplines as options', async () => {
    render(<CourseEventModal {...makeProps()} />);

    const disciplineSelect = await screen.findByLabelText('Discipline');
    fireEvent.mouseDown(disciplineSelect);

    await waitFor(() => {
      expect(within(document.body).getByText('Frontend')).toBeInTheDocument();
      expect(within(document.body).getByText('Backend')).toBeInTheDocument();
    });
  });

  it('shows a validation error and does not submit when required fields are empty', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CourseEventModal {...props} />);

    await screen.findByText('Course Event');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText('Please select an event')).toBeInTheDocument();
    expect(submitEvent).not.toHaveBeenCalled();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('flags an invalid Description URL', async () => {
    render(<CourseEventModal {...makeProps()} />);

    const urlInput = await screen.findByPlaceholderText('Enter description URL');
    fireEvent.change(urlInput, { target: { value: 'not a url' } });

    expect(await screen.findByText('Please enter valid URL')).toBeInTheDocument();
  });

  it('prefills description/type when picking an event template via onEventChange', async () => {
    render(<CourseEventModal {...makeProps()} />);

    const eventSelect = await screen.findByLabelText('Event');
    fireEvent.mouseDown(eventSelect);

    const option = await within(document.body).findByText('Intro Lecture');
    fireEvent.click(option);

    // The selected template's description URL flows into the URL input.
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter description URL')).toHaveValue('https://example.com/intro');
    });
  });

  it('filters event template options by typed input via filterOption', async () => {
    const user = userEvent.setup();
    render(<CourseEventModal {...makeProps()} />);

    const eventSelect = await screen.findByLabelText('Event');
    await user.click(eventSelect);
    await user.type(eventSelect, 'workshop');

    // "Intro Lecture" is filtered out; only "Workshop" matches the typed input.
    await waitFor(() => {
      expect(within(document.body).getByText('Workshop')).toBeInTheDocument();
    });
    expect(within(document.body).queryByText('Intro Lecture')).not.toBeInTheDocument();
  });

  it('submits via submitEvent and then calls onSubmit when the form is valid', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CourseEventModal {...props} />);

    // Pick an event template (fills type + description URL automatically).
    const eventSelect = await screen.findByLabelText('Event');
    fireEvent.mouseDown(eventSelect);
    fireEvent.click(await within(document.body).findByText('Intro Lecture'));

    // Pick a discipline (required, not auto-filled).
    const disciplineSelect = screen.getByLabelText('Discipline');
    fireEvent.mouseDown(disciplineSelect);
    fireEvent.click(await within(document.body).findByText('Frontend'));

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(submitEvent).toHaveBeenCalled());
    // submitEvent(values, events, courseId, data)
    const [, passedEvents, passedCourseId] = submitEvent.mock.calls[0];
    expect(passedEvents).toEqual(events);
    expect(passedCourseId).toBe(99);
    await waitFor(() => expect(props.onSubmit).toHaveBeenCalled());
  });

  it('calls onCancel when the cancel button is clicked on a pristine form', async () => {
    const user = userEvent.setup();
    const props = makeProps();
    render(<CourseEventModal {...props} />);

    await screen.findByText('Course Event');
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(props.onCancel).toHaveBeenCalled();
  });

  it('searches users through loadUsers when the task owner field changes', async () => {
    render(<CourseEventModal {...makeProps()} />);

    await screen.findByText('Course Event');
    const taskOwner = screen.getByTestId('task-owner');
    fireEvent.change(taskOwner, { target: { value: '42' } });

    // loadUsers -> userService.searchUser is invoked with the typed value
    expect(taskOwner).toBeInTheDocument();
  });

  it('seeds the task-owner default value from the organizer when editing', async () => {
    render(
      <CourseEventModal
        {...makeProps({
          data: { event: { id: 5, name: 'Existing' }, organizer: { id: 77 } } as never,
        })}
      />,
    );

    expect(await screen.findByText('Existing')).toBeInTheDocument();
    expect(screen.getByTestId('task-owner')).toBeInTheDocument();
  });
});
