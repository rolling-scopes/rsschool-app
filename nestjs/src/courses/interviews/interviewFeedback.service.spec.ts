import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StageInterview } from '@entities/stageInterview';
import { StageInterviewFeedback } from '@entities/stageInterviewFeedback';
import { InterviewFeedbackService } from './interviewFeedback.service';
import { StudentsService } from '../students';

// Chained QueryBuilder mock with a configurable terminal (getRawMany).
function createQb(rows: unknown[]) {
  const qb: Record<string, unknown> = {};
  for (const m of ['leftJoinAndSelect', 'where', 'andWhere', 'select']) {
    qb[m] = vi.fn(() => qb);
  }
  qb.getRawMany = vi.fn(async () => rows);
  return qb;
}

const repos = {
  stageInterview: { createQueryBuilder: vi.fn(), findOne: vi.fn(), findOneBy: vi.fn(), update: vi.fn() },
  stageInterviewFeedback: { createQueryBuilder: vi.fn(), findOne: vi.fn(), update: vi.fn(), insert: vi.fn() },
};
const studentsService = { setMentor: vi.fn() };

async function buildService() {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      InterviewFeedbackService,
      { provide: getRepositoryToken(StageInterview), useValue: repos.stageInterview },
      { provide: getRepositoryToken(StageInterviewFeedback), useValue: repos.stageInterviewFeedback },
      { provide: StudentsService, useValue: studentsService },
    ],
  }).compile();
  return module.get(InterviewFeedbackService);
}

describe('InterviewFeedbackService', () => {
  let service: InterviewFeedbackService;

  beforeEach(async () => {
    Object.values(repos).forEach(repo => Object.values(repo).forEach(fn => fn.mockReset()));
    studentsService.setMentor.mockReset().mockResolvedValue(undefined);
    service = await buildService();
  });

  describe('getCourseStageInterviewsComment', () => {
    it('extracts the comment to the student from each feedback json', async () => {
      const rows = [
        { si_id: '33', sif_json: JSON.stringify({ steps: { decision: { values: { comment: 'great job' } } } }) },
      ];
      repos.stageInterviewFeedback.createQueryBuilder.mockReturnValue(createQb(rows));

      const result = await service.getCourseStageInterviewsComment(5, 42);

      expect(result).toEqual([{ id: 33, commentToStudent: 'great job' }]);
    });

    it('falls back to null when the decision values are missing', async () => {
      const rows = [{ si_id: '34', sif_json: JSON.stringify({ steps: { decision: {} } }) }];
      repos.stageInterviewFeedback.createQueryBuilder.mockReturnValue(createQb(rows));

      const result = await service.getCourseStageInterviewsComment(5, 42);

      expect(result).toEqual([{ id: 34, commentToStudent: null }]);
    });

    it('returns an empty list when there are no feedback records', async () => {
      repos.stageInterviewFeedback.createQueryBuilder.mockReturnValue(createQb([]));

      expect(await service.getCourseStageInterviewsComment(5, 42)).toEqual([]);
    });
  });

  describe('getStageInterviewFeedback', () => {
    it('throws NotFoundException when the interview is missing', async () => {
      repos.stageInterview.findOne.mockResolvedValue(null);

      await expect(service.getStageInterviewFeedback(33, 'mentor-x')).rejects.toThrow(NotFoundException);
    });

    it('parses the latest feedback and returns completion and max score', async () => {
      repos.stageInterview.findOne.mockResolvedValue({
        isCompleted: true,
        courseTask: { maxScore: 100 },
        stageInterviewFeedbacks: [{ json: JSON.stringify({ a: 1 }), version: 2 }],
      });

      const result = await service.getStageInterviewFeedback(33, 'mentor-x');

      expect(result).toEqual({
        feedback: { json: { a: 1 }, version: 2 },
        isCompleted: true,
        maxScore: 100,
      });
    });

    it('returns a null feedback when there are no feedback entries', async () => {
      repos.stageInterview.findOne.mockResolvedValue({
        isCompleted: false,
        courseTask: { maxScore: 50 },
        stageInterviewFeedbacks: [],
      });

      const result = await service.getStageInterviewFeedback(33, 'mentor-x');

      expect(result).toEqual({ feedback: null, isCompleted: false, maxScore: 50 });
    });

    it('defaults json to {} and version to 0 when feedback fields are nullish', async () => {
      repos.stageInterview.findOne.mockResolvedValue({
        isCompleted: false,
        courseTask: { maxScore: 50 },
        stageInterviewFeedbacks: [{ json: null, version: null }],
      });

      const result = await service.getStageInterviewFeedback(33, 'mentor-x');

      expect(result.feedback).toEqual({ json: {}, version: 0 });
    });
  });

  describe('upsertInterviewFeedback', () => {
    const dto = {
      version: 1,
      json: { foo: 'bar' },
      decision: 'no',
      isGoodCandidate: false,
      isCompleted: true,
      score: 80,
    };

    it('throws ForbiddenException when the interview does not belong to the interviewer', async () => {
      repos.stageInterview.findOneBy.mockResolvedValue(null);

      await expect(service.upsertInterviewFeedback({ interviewId: 33, dto, interviewerId: 8 })).rejects.toThrow(
        ForbiddenException,
      );
      expect(repos.stageInterview.update).not.toHaveBeenCalled();
    });

    it('inserts new feedback, updates the interview, and does not assign a mentor when decision is not yes', async () => {
      repos.stageInterview.findOneBy.mockResolvedValue({ id: 33, studentId: 42 });
      repos.stageInterviewFeedback.findOne.mockResolvedValue(null);

      await service.upsertInterviewFeedback({ interviewId: 33, dto, interviewerId: 8 });

      expect(repos.stageInterviewFeedback.insert).toHaveBeenCalledWith({
        stageInterviewId: 33,
        json: JSON.stringify(dto.json),
        version: 1,
      });
      expect(repos.stageInterviewFeedback.update).not.toHaveBeenCalled();
      expect(repos.stageInterview.update).toHaveBeenCalledWith(33, {
        isCompleted: true,
        decision: 'no',
        isGoodCandidate: false,
        score: 80,
      });
      expect(studentsService.setMentor).not.toHaveBeenCalled();
    });

    it('updates existing feedback and assigns the mentor when the decision is yes', async () => {
      const yesDto = { ...dto, decision: 'yes' };
      repos.stageInterview.findOneBy.mockResolvedValue({ id: 33, studentId: 42 });
      repos.stageInterviewFeedback.findOne.mockResolvedValue({ id: 5 });

      await service.upsertInterviewFeedback({ interviewId: 33, dto: yesDto, interviewerId: 8 });

      expect(repos.stageInterviewFeedback.update).toHaveBeenCalledWith(5, {
        stageInterviewId: 33,
        json: JSON.stringify(yesDto.json),
        version: 1,
      });
      expect(repos.stageInterviewFeedback.insert).not.toHaveBeenCalled();
      expect(studentsService.setMentor).toHaveBeenCalledWith(42, 8);
    });
  });
});
