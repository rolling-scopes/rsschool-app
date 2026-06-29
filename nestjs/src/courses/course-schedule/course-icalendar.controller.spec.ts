import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from 'src/core/jwt/jwt.service';
import { CoursesService } from '../courses.service';
import { CourseICalendarController } from './course-icalendar.controller';
import { CourseICalendarService } from './course-icalendar.service';
import { CourseScheduleService } from './course-schedule.service';

const courseScheduleService = { getAll: vi.fn() };
const coursesService = { getById: vi.fn() };
const courseICalendarService = { validateUserCourse: vi.fn(), getICalendar: vi.fn() };
const jwtService = { createPublicCalendarToken: vi.fn(), validateToken: vi.fn() };

describe('CourseICalendarController', () => {
  let controller: CourseICalendarController;

  beforeEach(async () => {
    [courseScheduleService, coursesService, courseICalendarService, jwtService].forEach(svc =>
      Object.values(svc).forEach(fn => fn.mockReset()),
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseICalendarController],
      providers: [
        { provide: CourseScheduleService, useValue: courseScheduleService },
        { provide: CoursesService, useValue: coursesService },
        { provide: CourseICalendarService, useValue: courseICalendarService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    controller = module.get(CourseICalendarController);
  });

  describe('getScheduleICalendarToken', () => {
    it('creates a public calendar token scoped to the course and the current user', async () => {
      jwtService.createPublicCalendarToken.mockReturnValue('signed-token');
      const req = { user: { githubId: 'john-doe' } } as never;

      const result = await controller.getScheduleICalendarToken(req, 11);

      expect(jwtService.createPublicCalendarToken).toHaveBeenCalledWith({ courseId: 11, githubId: 'john-doe' });
      expect(result).toEqual({ token: 'signed-token' });
    });
  });

  describe('getScheduleICalendar', () => {
    it('validates the token, loads schedule + course, and returns the iCalendar string', async () => {
      const payload = { githubId: 'john-doe', courseId: 11 };
      jwtService.validateToken.mockReturnValue(payload);
      courseICalendarService.validateUserCourse.mockResolvedValue(true);
      const scheduleData = [{ id: 1 }];
      courseScheduleService.getAll.mockResolvedValue(scheduleData);
      coursesService.getById.mockResolvedValue({ name: 'RS Course' });
      courseICalendarService.getICalendar.mockResolvedValue('BEGIN:VCALENDAR');

      const result = await controller.getScheduleICalendar(11, 'the-token', 'Europe/London');

      expect(jwtService.validateToken).toHaveBeenCalledWith('the-token');
      expect(courseICalendarService.validateUserCourse).toHaveBeenCalledWith(11, payload);
      expect(courseScheduleService.getAll).toHaveBeenCalledWith(11);
      expect(coursesService.getById).toHaveBeenCalledWith(11);
      expect(courseICalendarService.getICalendar).toHaveBeenCalledWith(scheduleData, 'RS Course', 'Europe/London');
      expect(result).toBe('BEGIN:VCALENDAR');
    });

    it('falls back to Europe/Minsk when no timezone query is provided', async () => {
      jwtService.validateToken.mockReturnValue({ githubId: 'john-doe', courseId: 11 });
      courseICalendarService.validateUserCourse.mockResolvedValue(true);
      courseScheduleService.getAll.mockResolvedValue([]);
      coursesService.getById.mockResolvedValue({ name: 'RS Course' });
      courseICalendarService.getICalendar.mockResolvedValue('ICS');

      await controller.getScheduleICalendar(11, 'the-token', '');

      expect(courseICalendarService.getICalendar).toHaveBeenCalledWith([], 'RS Course', 'Europe/Minsk');
    });

    it('propagates validation failures from the iCalendar service', async () => {
      jwtService.validateToken.mockReturnValue({ githubId: 'john-doe', courseId: 11 });
      courseICalendarService.validateUserCourse.mockRejectedValue(new Error('forbidden'));

      await expect(controller.getScheduleICalendar(11, 'the-token', 'UTC')).rejects.toThrow('forbidden');
      expect(courseScheduleService.getAll).not.toHaveBeenCalled();
    });
  });
});
