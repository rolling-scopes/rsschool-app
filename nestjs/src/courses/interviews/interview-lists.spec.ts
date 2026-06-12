import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseTask } from '@entities/courseTask';
import { TaskInterviewStudent } from '@entities/taskInterviewStudent';
import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { Student } from '@entities/student';
import { Mentor } from '@entities/mentor';
import { StageInterview } from '@entities/stageInterview';
import { StageInterviewStudent } from '@entities/stageInterviewStudent';
import { TaskChecker } from '@entities/taskChecker';
import { User } from '@entities/user';
import { InterviewsService } from './interviews.service';
import { CrossMentorDistributionService } from './cross-mentor-distribution.service';
import { UserNotificationsService } from 'src/users-notifications';

// Fixtures mirrored from server/src/routes/course/__test__/interviewLists.test.ts to prove business-logic equivalence
const regular = [{ id: 1, name: 'tech-interview' }];
const stage = [{ id: 2, name: 'stage-interview' }];

describe('InterviewsService.getUserInterviewDetails', () => {
  let service: InterviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        { provide: getRepositoryToken(CourseTask), useValue: {} },
        { provide: getRepositoryToken(TaskInterviewStudent), useValue: {} },
        { provide: getRepositoryToken(TaskInterviewResult), useValue: {} },
        { provide: getRepositoryToken(Student), useValue: {} },
        { provide: getRepositoryToken(Mentor), useValue: {} },
        { provide: getRepositoryToken(StageInterview), useValue: {} },
        { provide: getRepositoryToken(StageInterviewStudent), useValue: {} },
        { provide: getRepositoryToken(TaskChecker), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: CrossMentorDistributionService, useValue: {} },
        { provide: UserNotificationsService, useValue: {} },
      ],
    }).compile();
    service = module.get(InterviewsService);
  });

  it('returns stage interviews first, then regular interviews, for both user types', async () => {
    vi.spyOn(service as never, 'getRegularInterviewDetails' as never).mockResolvedValue(regular as never);
    vi.spyOn(service as never, 'getStageInterviewDetails' as never).mockResolvedValue(stage as never);

    const studentResult = await service.getUserInterviewDetails(5, 'john-doe', 'student');
    expect(studentResult).toEqual([...stage, ...regular]);
    expect((service as never as { getRegularInterviewDetails: ReturnType<typeof vi.fn> }).getRegularInterviewDetails)
      .toHaveBeenCalledWith(5, 'john-doe', 'student');

    const mentorResult = await service.getUserInterviewDetails(5, 'john-doe', 'mentor');
    expect(mentorResult).toEqual([...stage, ...regular]);
  });
});
