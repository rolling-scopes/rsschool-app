import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ScoreController } from './score.controller';
import { ScoreService } from './score.service';
import { WriteScoreService } from './write-score.service';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { ConfigService } from 'src/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// Fixtures mirrored from server/src/routes/course/__test__/createSingleScore.test.ts to prove business-logic equivalence
const mockStudent = { id: 42, user: { id: 100 }, githubId: 'john-doe' };
const mockCourseTask = { id: 7, course: { alias: 'js-2026' } };
const session = { id: 1, githubId: 'viewer', isAdmin: false, courses: {} } as never;

const scoreService = {
  getStudentForScore: vi.fn(),
  getCourseTaskWithCourse: vi.fn(),
  getMentorByUserId: vi.fn(),
};
const mockSaveScore = vi.fn();
const mockSendEventNotification = vi.fn();

describe('createSingleScore route', () => {
  let controller: ScoreController;

  beforeEach(async () => {
    Object.values(scoreService).forEach(fn => fn.mockReset());
    mockSaveScore.mockReset().mockResolvedValue({ score: 50 });
    mockSendEventNotification.mockReset().mockResolvedValue(undefined);
    scoreService.getStudentForScore.mockResolvedValue(mockStudent);
    scoreService.getCourseTaskWithCourse.mockResolvedValue(mockCourseTask);
    scoreService.getMentorByUserId.mockResolvedValue({ id: 8 });
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScoreController],
      providers: [
        { provide: ScoreService, useValue: scoreService },
        { provide: WriteScoreService, useValue: { saveScore: mockSaveScore } },
        { provide: UserNotificationsService, useValue: { sendEventNotification: mockSendEventNotification } },
        { provide: ConfigService, useValue: { host: 'https://app.rs.school' } },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();
    controller = module.get(ScoreController);
  });

  it('responds 400 for unknown student, NaN score, unknown course task and invalid submitter', async () => {
    scoreService.getStudentForScore.mockResolvedValue(null);
    await expect(
      controller.createSingleScore({ user: session } as never, 5, 7, 'john-doe', { score: 90 }),
    ).rejects.toThrow(BadRequestException);

    scoreService.getStudentForScore.mockResolvedValue(mockStudent);
    await expect(
      controller.createSingleScore({ user: session } as never, 5, 7, 'john-doe', { score: 'abc' }),
    ).rejects.toThrow(BadRequestException);

    scoreService.getCourseTaskWithCourse.mockResolvedValue(null);
    await expect(
      controller.createSingleScore({ user: session } as never, 5, 7, 'john-doe', { score: 90 }),
    ).rejects.toThrow(BadRequestException);

    scoreService.getCourseTaskWithCourse.mockResolvedValue(mockCourseTask);
    scoreService.getMentorByUserId.mockResolvedValue(null);
    await expect(
      controller.createSingleScore({ user: session } as never, 5, 7, 'john-doe', { score: 90 }),
    ).rejects.toThrow(BadRequestException);
    expect(mockSaveScore).not.toHaveBeenCalled();
  });

  it('saves rounded score with defaulted comment and sends taskGrade notification', async () => {
    await controller.createSingleScore({ user: session } as never, 5, 7, 'john-doe', {
      score: '89.6',
      githubPrUrl: 'https://pr',
    });

    expect(mockSaveScore).toHaveBeenCalledWith(42, 7, {
      score: 90,
      comment: '',
      githubPrUrl: 'https://pr',
      authorId: 1,
    });
    expect(mockSendEventNotification).toHaveBeenCalledWith({
      userId: 100,
      notificationId: 'taskGrade',
      data: {
        previousScore: { score: 50 },
        courseTask: mockCourseTask,
        score: 90,
        comment: '',
        resultLink: 'https://app.rs.school/course/student/dashboard?course=js-2026&statType=completed',
      },
    });
  });

  it('swallows notification failures', async () => {
    mockSendEventNotification.mockRejectedValue(new Error('boom'));

    await expect(
      controller.createSingleScore({ user: session } as never, 5, 7, 'john-doe', { score: 90, comment: 'good' }),
    ).resolves.toBeUndefined();
  });
});
