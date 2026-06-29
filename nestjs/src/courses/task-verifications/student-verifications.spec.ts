import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskVerification } from '@entities/taskVerification';
import { CourseTask } from '@entities/courseTask';
import { Student } from '@entities/student';
import { TaskVerificationsService } from './task-verifications.service';
import { CloudApiService } from 'src/cloud-api/cloud-api.service';
import { SelfEducationService } from './self-education.service';
import { StudentTaskVerificationsController } from './task-verifications.controller';

// Fixtures mirrored from server/src/routes/course/__test__/studentVerifications.test.ts.
// The endpoint now returns the verifications grouped by courseTaskId (see CourseTaskVerificationsDto).
const mockVerifications = [{ id: 1, status: 'completed', score: 90, courseTaskId: 10 }];

const taskVerificationsRepository = { createQueryBuilder: vi.fn() };
const studentsRepository = { createQueryBuilder: vi.fn() };

const createVerificationsQb = (result: unknown[]) => {
  const qb = {
    innerJoin: vi.fn(),
    addSelect: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    orderBy: vi.fn(),
    getMany: vi.fn().mockResolvedValue(result),
  };
  qb.innerJoin.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  qb.orderBy.mockReturnValue(qb);
  return qb;
};

const createStudentQb = (student: unknown) => {
  const qb = {
    innerJoin: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    getOne: vi.fn().mockResolvedValue(student),
  };
  qb.innerJoin.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  return qb;
};

describe('student verifications', () => {
  let controller: StudentTaskVerificationsController;
  let verificationsQb: ReturnType<typeof createVerificationsQb>;

  beforeEach(async () => {
    taskVerificationsRepository.createQueryBuilder.mockReset();
    studentsRepository.createQueryBuilder.mockReset();
    verificationsQb = createVerificationsQb(mockVerifications);
    taskVerificationsRepository.createQueryBuilder.mockReturnValue(verificationsQb);
    studentsRepository.createQueryBuilder.mockReturnValue(createStudentQb({ id: 42 }));
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentTaskVerificationsController],
      providers: [
        TaskVerificationsService,
        { provide: getRepositoryToken(TaskVerification), useValue: taskVerificationsRepository },
        { provide: getRepositoryToken(CourseTask), useValue: {} },
        { provide: getRepositoryToken(Student), useValue: studentsRepository },
        { provide: CloudApiService, useValue: {} },
        { provide: SelfEducationService, useValue: {} },
      ],
    }).compile();
    controller = module.get(StudentTaskVerificationsController);
  });

  it('returns verifications of enabled course tasks ordered by update date desc', async () => {
    const result = await controller.getStudentTaskVerifications({ user: { githubId: 'john-doe' } } as never, 5);

    expect(verificationsQb.innerJoin).toHaveBeenCalledWith('v.courseTask', 'courseTask');
    expect(verificationsQb.innerJoin).toHaveBeenCalledWith('courseTask.task', 'task');
    expect(verificationsQb.addSelect).toHaveBeenCalledWith(['task.name', 'courseTask.id', 'courseTask.type']);
    expect(verificationsQb.where).toHaveBeenCalledWith('v.studentId = :id', { id: 42 });
    expect(verificationsQb.andWhere).toHaveBeenCalledWith('courseTask.disabled = :disabled', { disabled: false });
    expect(verificationsQb.orderBy).toHaveBeenCalledWith('v.updatedDate', 'DESC');
    expect(result).toEqual([{ courseTaskId: 10, verifications: mockVerifications }]);
  });

  it('responds 400 when student is not found in the course', async () => {
    studentsRepository.createQueryBuilder.mockReturnValue(createStudentQb(null));

    await expect(
      controller.getStudentTaskVerifications({ user: { githubId: 'john-doe' } } as never, 5),
    ).rejects.toThrow(BadRequestException);
  });
});
