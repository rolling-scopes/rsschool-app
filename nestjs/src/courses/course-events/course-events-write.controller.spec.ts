import { Test, TestingModule } from '@nestjs/testing';
import { CourseEvent } from '@entities/courseEvent';
import { CourseEventsController } from './course-events.controller';
import { CourseEventsService } from './course-events.service';

// Covers the manager/admin write endpoints (create/update/delete) which the
// read-only course-events.controller.spec does not exercise.
const mockCourseId = 7;

const mockCreatedEvent = {
  id: 200,
  eventId: 5,
  courseId: mockCourseId,
  event: {
    id: 5,
    name: 'New Lecture',
    type: 'lecture_online',
    description: 'desc',
    descriptionUrl: 'https://example.com',
    disciplineId: null,
  },
  organizer: { id: 10, firstName: 'John', lastName: 'Doe', githubId: 'john-doe' },
  organizerId: 10,
  dateTime: new Date('2026-02-01T10:00:00.000Z'),
  endTime: new Date('2026-02-01T12:00:00.000Z'),
  place: 'Online',
  comment: 'c',
  special: '',
} as unknown as CourseEvent;

const service = {
  createCourseEvent: vi.fn(),
  updateCourseEvent: vi.fn(),
  deleteCourseEvent: vi.fn(),
};

describe('CourseEventsController write endpoints', () => {
  let controller: CourseEventsController;

  beforeEach(async () => {
    Object.values(service).forEach(fn => fn.mockReset());
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseEventsController],
      providers: [{ provide: CourseEventsService, useValue: service }],
    }).compile();

    controller = module.get(CourseEventsController);
  });

  describe('createCourseTask', () => {
    it('injects courseId into the dto and returns the created event as a CourseEventDto', async () => {
      service.createCourseEvent.mockResolvedValue(mockCreatedEvent);
      const dto = { eventId: 5, place: 'Online' } as never;

      const result = await controller.createCourseTask(mockCourseId, dto);

      expect(service.createCourseEvent).toHaveBeenCalledWith({ courseId: mockCourseId, eventId: 5, place: 'Online' });
      expect(result).toMatchObject({
        id: 200,
        eventId: 5,
        name: 'New Lecture',
        organizer: { id: 10, name: 'John Doe', githubId: 'john-doe' },
      });
    });
  });

  describe('updateCourseTask', () => {
    it('updates by courseEventId merging courseId and id into the dto', async () => {
      service.updateCourseEvent.mockResolvedValue(undefined);
      const dto = { place: 'Offline' } as never;

      const result = await controller.updateCourseTask(mockCourseId, 200, dto);

      expect(service.updateCourseEvent).toHaveBeenCalledWith(200, {
        courseId: mockCourseId,
        id: 200,
        place: 'Offline',
      });
      expect(result).toBeUndefined();
    });
  });

  describe('deleteCourseEvent', () => {
    it('delegates deletion to the service by courseEventId', async () => {
      service.deleteCourseEvent.mockResolvedValue(undefined);

      await controller.deleteCourseEvent(200);

      expect(service.deleteCourseEvent).toHaveBeenCalledWith(200);
    });
  });
});
