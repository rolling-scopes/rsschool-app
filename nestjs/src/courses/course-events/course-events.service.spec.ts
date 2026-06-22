import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseEvent } from '@entities/courseEvent';
import { CourseEventsService } from './course-events.service';

// Fixtures mirrored from server/src/routes/course/__test__/events.test.ts to prove business-logic equivalence
const mockCourseId = 7;

const mockOrganizer = {
  id: 10,
  firstName: 'John',
  lastName: 'Doe',
  githubId: 'john-doe',
};

const mockCourseEvents = [
  {
    id: 101,
    eventId: 1,
    courseId: mockCourseId,
    event: {
      id: 1,
      name: 'Intro Lecture',
      type: 'lecture_online',
      description: 'Course introduction',
      descriptionUrl: 'https://example.com/intro',
      disciplineId: 3,
    },
    organizer: mockOrganizer,
    organizerId: mockOrganizer.id,
    dateTime: new Date('2026-01-10T10:00:00.000Z'),
    endTime: new Date('2026-01-10T12:00:00.000Z'),
    place: 'Online',
    comment: 'Bring questions',
    special: 'registration',
  },
  {
    id: 102,
    eventId: 2,
    courseId: mockCourseId,
    event: {
      id: 2,
      name: 'Final Workshop',
      type: 'workshop',
      description: null,
      descriptionUrl: null,
      disciplineId: null,
    },
    organizer: null,
    organizerId: null,
    dateTime: null,
    endTime: null,
    place: null,
    comment: null,
    special: '',
  },
] as unknown as CourseEvent[];

const createQueryBuilderMock = (result: CourseEvent[]) => {
  const qb = {
    innerJoinAndSelect: vi.fn(),
    leftJoin: vi.fn(),
    addSelect: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    getMany: vi.fn().mockResolvedValue(result),
  };
  qb.innerJoinAndSelect.mockReturnValue(qb);
  qb.leftJoin.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.orderBy.mockReturnValue(qb);
  return qb;
};

describe('CourseEventsService', () => {
  let service: CourseEventsService;
  const mockCreateQueryBuilder = vi.fn();

  beforeEach(async () => {
    mockCreateQueryBuilder.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseEventsService,
        {
          provide: getRepositoryToken(CourseEvent),
          useValue: { createQueryBuilder: mockCreateQueryBuilder },
        },
      ],
    }).compile();

    service = module.get(CourseEventsService);
  });

  describe('getCourseEvents query contract', () => {
    it('selects course events with joined event, limited organizer fields, filtered by courseId, ordered by dateTime', async () => {
      const qb = createQueryBuilderMock(mockCourseEvents);
      mockCreateQueryBuilder.mockReturnValue(qb);

      const result = await service.getCourseEvents(mockCourseId);

      expect(mockCreateQueryBuilder).toHaveBeenCalledWith('courseEvent');
      expect(qb.innerJoinAndSelect).toHaveBeenCalledWith('courseEvent.event', 'event');
      expect(qb.leftJoin).toHaveBeenCalledWith('courseEvent.organizer', 'organizer');
      expect(qb.addSelect).toHaveBeenCalledWith([
        'organizer.id',
        'organizer.firstName',
        'organizer.lastName',
        'organizer.githubId',
      ]);
      expect(qb.where).toHaveBeenCalledWith('courseEvent.courseId = :courseId', { courseId: mockCourseId });
      expect(qb.orderBy).toHaveBeenCalledWith('courseEvent.dateTime');
      expect(result).toBe(mockCourseEvents);
    });

    it('returns an empty list as-is when no events exist', async () => {
      const qb = createQueryBuilderMock([]);
      mockCreateQueryBuilder.mockReturnValue(qb);

      const result = await service.getCourseEvents(mockCourseId);

      expect(result).toEqual([]);
    });
  });
});
