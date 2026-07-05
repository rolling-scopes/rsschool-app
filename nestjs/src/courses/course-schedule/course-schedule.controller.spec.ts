import { Test, TestingModule } from '@nestjs/testing';
import { CourseScheduleController } from './course-schedule.controller';
import { CourseScheduleService } from './course-schedule.service';

// Covers getAll + copyFrom; the csv endpoint is exercised by course-schedule-csv.controller.spec.
const mockScheduleItems = [
  {
    id: 22,
    name: 'Test Task',
    startDate: new Date('2026-01-10T11:00:00.000Z'),
    endDate: new Date('2026-01-20T23:00:00.000Z'),
    maxScore: 100,
    scoreWeight: 1,
    organizer: null,
    status: 'available',
    score: null,
    tag: 'coding',
    descriptionUrl: 'https://example.com/test',
    type: 'jstask',
  },
];

const service = {
  getAll: vi.fn(),
  copyFromTo: vi.fn(),
};

describe('CourseScheduleController', () => {
  let controller: CourseScheduleController;

  beforeEach(async () => {
    Object.values(service).forEach(fn => fn.mockReset());
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseScheduleController],
      providers: [{ provide: CourseScheduleService, useValue: service }],
    }).compile();

    controller = module.get(CourseScheduleController);
  });

  describe('getAll', () => {
    it('passes the resolved studentId from the request and maps items into CourseScheduleItemDto', async () => {
      service.getAll.mockResolvedValue(mockScheduleItems);
      const req = { user: { courses: { 11: { studentId: 55 } } } } as never;

      const result = await controller.getAll(req, 11);

      expect(service.getAll).toHaveBeenCalledWith(11, 55);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 22,
        name: 'Test Task',
        startDate: '2026-01-10T11:00:00.000Z',
        endDate: '2026-01-20T23:00:00.000Z',
        status: 'available',
        type: 'jstask',
      });
    });

    it('passes undefined studentId when the user is not a student of the course', async () => {
      service.getAll.mockResolvedValue([]);
      const req = { user: { courses: {} } } as never;

      const result = await controller.getAll(req, 11);

      expect(service.getAll).toHaveBeenCalledWith(11, undefined);
      expect(result).toEqual([]);
    });
  });

  describe('copyFrom', () => {
    it('copies schedule from the source course into the route course', async () => {
      service.copyFromTo.mockResolvedValue(undefined);

      const result = await controller.copyFrom(11, { copyFromCourseId: 9 } as never);

      expect(service.copyFromTo).toHaveBeenCalledWith(9, 11);
      expect(result).toBeUndefined();
    });
  });
});
