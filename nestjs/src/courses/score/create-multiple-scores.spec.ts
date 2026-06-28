import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ScoreController } from './score.controller';
import { ScoreService } from './score.service';
import { WriteScoreService } from './write-score.service';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { ConfigService } from 'src/config';

// Fixtures mirrored from server/src/routes/course/__test__/createMultipleScores.test.ts to prove business-logic equivalence
const mockStudent = { id: 42, user: { githubId: 'john-doe' } };

const scoreService = { getStudentForScore: vi.fn() };
const mockSaveScoreWithStatus = vi.fn();

describe('createMultipleScores route', () => {
  let controller: ScoreController;

  beforeEach(async () => {
    scoreService.getStudentForScore.mockReset();
    mockSaveScoreWithStatus.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScoreController],
      providers: [
        { provide: ScoreService, useValue: scoreService },
        { provide: WriteScoreService, useValue: { saveScoreWithStatus: mockSaveScoreWithStatus } },
        { provide: UserNotificationsService, useValue: { sendEventNotification: vi.fn() } },
        { provide: ConfigService, useValue: { host: 'https://app.rs.school' } },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();
    controller = module.get(ScoreController);
  });

  it('rounds scores, defaults comment/url, reports created and updated statuses', async () => {
    scoreService.getStudentForScore.mockResolvedValue(mockStudent);
    mockSaveScoreWithStatus
      .mockResolvedValueOnce({ created: true })
      .mockResolvedValueOnce({ created: false, previousScore: { score: 10 } });

    const result = await controller.createMultipleScores({ user: { id: 1 } } as never, 5, 7, [
      { studentGithubId: 'john-doe', score: '89.6', comment: 'good' },
      { studentGithubId: 'john-doe', score: 50 },
    ]);

    expect(mockSaveScoreWithStatus).toHaveBeenNthCalledWith(1, 42, 7, {
      authorId: 1,
      comment: 'good',
      score: 90,
      githubPrUrl: '',
    });
    expect(mockSaveScoreWithStatus).toHaveBeenNthCalledWith(2, 42, 7, {
      authorId: 1,
      comment: '',
      score: 50,
      githubPrUrl: '',
    });
    expect(result).toEqual([
      { status: 'created', value: undefined },
      { status: 'updated', value: undefined },
    ]);
  });

  it('defaults the author id to 0 when the request has no user', async () => {
    scoreService.getStudentForScore.mockResolvedValue(mockStudent);
    mockSaveScoreWithStatus.mockResolvedValue({ created: true });

    await controller.createMultipleScores({} as never, 5, 7, [{ studentGithubId: 'john-doe', score: 10 }]);

    expect(mockSaveScoreWithStatus).toHaveBeenCalledWith(42, 7, expect.objectContaining({ authorId: 0 }));
  });

  it('skips unknown students and reports failures per item', async () => {
    scoreService.getStudentForScore.mockResolvedValueOnce(null).mockResolvedValueOnce(mockStudent);
    mockSaveScoreWithStatus.mockRejectedValueOnce(new Error('boom'));

    const result = await controller.createMultipleScores({ user: { id: 1 } } as never, 5, 7, [
      { studentGithubId: 'ghost', score: 10 },
      { studentGithubId: 'john-doe', score: 20 },
    ]);

    expect(result).toEqual([
      { status: 'skipped', value: 'no student: ghost' },
      { status: 'failed', value: 'boom' },
    ]);
  });
});
