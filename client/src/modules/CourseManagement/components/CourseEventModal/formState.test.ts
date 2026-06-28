import { message } from 'antd';
import dayjs from 'dayjs';
import { CourseEventDtoTypeEnum, EventDto } from '@client/api';
import { CourseEvent } from '@client/services/course';
import { getInitialValues, submitEvent } from './formState';

vi.mock('antd', async importOriginal => {
  const actual = await importOriginal<typeof import('antd')>();
  return { ...actual, message: { ...actual.message, error: vi.fn() } };
});

const { createEvent, updateEvent } = vi.hoisted(() => ({
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
}));
vi.mock('@client/api', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/api')>();
  function MockEventsApi() {}
  MockEventsApi.prototype.createEvent = createEvent;
  MockEventsApi.prototype.updateEvent = updateEvent;
  return { ...actual, EventsApi: MockEventsApi };
});

const { createCourseEvent, updateCourseEvent } = vi.hoisted(() => ({
  createCourseEvent: vi.fn(),
  updateCourseEvent: vi.fn(),
}));
vi.mock('@client/services/course', async importOriginal => {
  const actual = await importOriginal<typeof import('@client/services/course')>();
  function MockCourseService() {}
  MockCourseService.prototype.createCourseEvent = createCourseEvent;
  MockCourseService.prototype.updateCourseEvent = updateCourseEvent;
  return { ...actual, CourseService: MockCourseService };
});

const baseValues = {
  event: '7',
  type: CourseEventDtoTypeEnum.Workshop,
  descriptionUrl: 'https://example.com',
  description: 'desc',
  disciplineId: 11,
  dateTime: '2024-01-01T10:00:00.000Z',
  endTime: '2024-01-01T12:00:00.000Z',
  place: 'Room 1',
  timeZone: 'UTC',
  special: ['a', 'b'],
  taskOwner: { id: 55 },
};

describe('formState.submitEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createEvent.mockResolvedValue({ data: { id: 7 } });
    updateEvent.mockResolvedValue({ data: { id: 7 } });
    createCourseEvent.mockResolvedValue(undefined);
    updateCourseEvent.mockResolvedValue(undefined);
  });

  it('creates a new event template and a new course event', async () => {
    await submitEvent(baseValues, [], 99);

    expect(createEvent).toHaveBeenCalledTimes(1);
    expect(createCourseEvent).toHaveBeenCalledTimes(1);
    const record = createCourseEvent.mock.calls[0][0];
    expect(record.eventId).toBe(7);
    expect(record.special).toBe('a,b');
    expect(record.place).toBe('Room 1');
    expect(record.organizer).toEqual({ id: 55 });
  });

  it('updates the existing template (from editableRecord) and updates the course event', async () => {
    const editableRecord = {
      id: 500,
      event: { id: 7, name: 'Existing' } as EventDto,
    } as Partial<CourseEvent>;

    await submitEvent(baseValues, [], 99, editableRecord);

    expect(updateEvent).toHaveBeenCalledWith(7, expect.objectContaining({ name: 'Existing' }));
    expect(updateCourseEvent).toHaveBeenCalledTimes(1);
    expect(createCourseEvent).not.toHaveBeenCalled();
  });

  it('finds the template from the events list by id when not editing', async () => {
    const events = [{ id: 7, name: 'From list' } as EventDto];
    await submitEvent(baseValues, events, 99);

    // existing template found => updateEvent path
    expect(updateEvent).toHaveBeenCalledWith(7, expect.objectContaining({ name: 'From list' }));
  });

  it('shows an error and stops when the template creation fails', async () => {
    createEvent.mockRejectedValueOnce(new Error('nope'));

    await submitEvent(baseValues, [], 99);

    expect(message.error).toHaveBeenCalledWith('Failed to create event template. Please try later.');
    // No template id => no course event persistence
    expect(createCourseEvent).not.toHaveBeenCalled();
  });

  it('shows an error when updating the template fails', async () => {
    updateEvent.mockRejectedValueOnce(new Error('nope'));
    const editableRecord = { id: 1, event: { id: 7, name: 'Existing' } as EventDto } as Partial<CourseEvent>;

    await submitEvent(baseValues, [], 99, editableRecord);

    expect(message.error).toHaveBeenCalledWith('Failed to update event template. Please try later.');
    expect(updateCourseEvent).not.toHaveBeenCalled();
  });

  it('shows an error when creating the course event fails', async () => {
    createCourseEvent.mockRejectedValueOnce(new Error('nope'));

    await submitEvent(baseValues, [], 99);

    expect(message.error).toHaveBeenCalledWith('Failed to create event. Please try later.');
  });

  it('shows an error when updating the course event fails', async () => {
    updateCourseEvent.mockRejectedValueOnce(new Error('nope'));
    const editableRecord = { id: 1, event: { id: 7, name: 'Existing' } as EventDto } as Partial<CourseEvent>;

    await submitEvent(baseValues, [], 99, editableRecord);

    expect(message.error).toHaveBeenCalledWith('Failed to update event. Please try later.');
  });

  it('omits optional fields and defaults place/organizer when not provided', async () => {
    const minimal = {
      event: '7',
      type: CourseEventDtoTypeEnum.Workshop,
      timeZone: 'UTC',
    };

    await submitEvent(minimal, [], 99);

    const record = createCourseEvent.mock.calls[0][0];
    expect(record.special).toBe('');
    expect(record.dateTime).toBeUndefined();
    expect(record.endTime).toBeUndefined();
    expect(record.place).toBeNull();
    expect(record.organizer).toBeUndefined();
  });
});

describe('formState.getInitialValues', () => {
  it('maps a fully-populated record into form values', () => {
    const modalData = {
      id: 1,
      event: {
        type: CourseEventDtoTypeEnum.Workshop,
        discipline: { id: 11 },
        descriptionUrl: 'https://example.com',
        description: 'desc',
      },
      organizer: { id: 55 },
      special: 'a,b',
      dateTime: '2024-01-01T10:00:00.000Z',
      endTime: '2024-01-01T12:00:00.000Z',
    } as unknown as Partial<CourseEvent>;

    const values = getInitialValues(modalData);

    expect(values.type).toBe(CourseEventDtoTypeEnum.Workshop);
    expect(values.disciplineId).toBe(11);
    expect(values.descriptionUrl).toBe('https://example.com');
    expect(values.description).toBe('desc');
    expect(values.taskOwner).toEqual({ id: 55 });
    expect(values.special).toEqual(['a', 'b']);
    expect(dayjs.isDayjs(values.dateTime)).toBe(true);
    expect(values.timeZone).toBe('UTC');
  });

  it('falls back to empty / null defaults for a blank record', () => {
    const values = getInitialValues({} as Partial<CourseEvent>);

    expect(values.type).toBeNull();
    expect(values.descriptionUrl).toBe('');
    expect(values.description).toBe('');
    expect(values.taskOwner).toBeUndefined();
    expect(values.special).toEqual([]);
  });

  it('uses event.disciplineId when no nested discipline object exists', () => {
    const values = getInitialValues({
      event: { disciplineId: 77 },
    } as unknown as Partial<CourseEvent>);

    expect(values.disciplineId).toBe(77);
  });
});
