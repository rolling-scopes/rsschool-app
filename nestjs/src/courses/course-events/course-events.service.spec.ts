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
  const repo = {
    createQueryBuilder: mockCreateQueryBuilder,
    save: vi.fn(),
    findOneOrFail: vi.fn(),
    update: vi.fn(),
    findOneByOrFail: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    Object.values(repo).forEach(fn => fn.mockReset());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseEventsService,
        {
          provide: getRepositoryToken(CourseEvent),
          useValue: repo,
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

  describe('createCourseEvent', () => {
    it('saves the event then reloads it with organizer and event relations', async () => {
      const input = { courseId: mockCourseId, eventId: 1, organizer: { id: 10 } };
      repo.save.mockResolvedValue({ id: 101 });
      repo.findOneOrFail.mockResolvedValue(mockCourseEvents[0]);

      const result = await service.createCourseEvent(input);

      expect(repo.save).toHaveBeenCalledWith(input);
      expect(repo.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 101 },
        relations: ['organizer', 'event'],
      });
      expect(result).toBe(mockCourseEvents[0]);
    });
  });

  describe('updateCourseEvent', () => {
    it('updates by id and returns the reloaded entity', async () => {
      const patch = { courseId: mockCourseId, id: 101, place: 'Offline' };
      repo.update.mockResolvedValue({ affected: 1 });
      repo.findOneByOrFail.mockResolvedValue(mockCourseEvents[0]);

      const result = await service.updateCourseEvent(101, patch);

      expect(repo.update).toHaveBeenCalledWith(101, patch);
      expect(repo.findOneByOrFail).toHaveBeenCalledWith({ id: 101 });
      expect(result).toBe(mockCourseEvents[0]);
    });
  });

  describe('deleteCourseEvent', () => {
    it('loads the entity by id then removes it', async () => {
      repo.findOneByOrFail.mockResolvedValue(mockCourseEvents[0]);
      repo.remove.mockResolvedValue(mockCourseEvents[0]);

      const result = await service.deleteCourseEvent(101);

      expect(repo.findOneByOrFail).toHaveBeenCalledWith({ id: 101 });
      expect(repo.remove).toHaveBeenCalledWith(mockCourseEvents[0]);
      expect(result).toBe(mockCourseEvents[0]);
    });
  });
});
