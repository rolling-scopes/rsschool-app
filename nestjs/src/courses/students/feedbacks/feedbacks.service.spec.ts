import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityNotFoundError } from 'typeorm';
import { Mentor } from '@entities/mentor';
import { Student } from '@entities/student';
import { StudentFeedback } from '@entities/student-feedback';
import { FeedbacksService } from './feedbacks.service';
import { CreateStudentFeedbackDto, UpdateStudentFeedbackDto } from './dto';

// Fluent QueryBuilder mock. Chained methods return qb; terminals resolve the row.
type Terminals = { getOne?: unknown; getOneOrFail?: unknown };
const createQb = (terminals: Terminals = {}) => {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of ['leftJoin', 'addSelect', 'where', 'andWhere']) {
    qb[method] = vi.fn(() => qb);
  }
  qb.getOne = vi.fn(async () => terminals.getOne ?? null);
  qb.getOneOrFail = vi.fn(async () => {
    if (terminals.getOneOrFail === undefined) {
      throw new EntityNotFoundError(StudentFeedback, {});
    }
    return terminals.getOneOrFail;
  });
  return qb;
};

const studentFeedbacksRepository = {
  createQueryBuilder: vi.fn(),
  save: vi.fn(),
};
const studentsRepository = {
  findOneByOrFail: vi.fn(),
};
const mentorsRepository = {
  findOneByOrFail: vi.fn(),
};

const createDto: CreateStudentFeedbackDto = {
  content: { suggestions: 's', recommendationComment: 'c', softSkills: [] },
  recommendation: 'hire',
  englishLevel: 'b2',
} as never;

describe('FeedbacksService', () => {
  let service: FeedbacksService;

  beforeEach(async () => {
    [studentFeedbacksRepository, studentsRepository, mentorsRepository].forEach(repo =>
      Object.values(repo).forEach(fn => (fn as ReturnType<typeof vi.fn>).mockReset()),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbacksService,
        { provide: getRepositoryToken(StudentFeedback), useValue: studentFeedbacksRepository },
        { provide: getRepositoryToken(Student), useValue: studentsRepository },
        { provide: getRepositoryToken(Mentor), useValue: mentorsRepository },
      ],
    }).compile();

    service = module.get(FeedbacksService);
  });

  describe('createStudentFeedback', () => {
    it('creates a feedback when none exists yet and returns the persisted record', async () => {
      studentsRepository.findOneByOrFail.mockResolvedValue({ id: 42, courseId: 5 });
      mentorsRepository.findOneByOrFail.mockResolvedValue({ id: 8 });
      // getByStudentAndMentor -> no existing feedback
      // getById -> the saved feedback
      studentFeedbacksRepository.createQueryBuilder
        .mockReturnValueOnce(createQb({ getOne: null }))
        .mockReturnValueOnce(createQb({ getOneOrFail: { id: 100 } }));
      studentFeedbacksRepository.save.mockResolvedValue({ id: 100 });

      const result = await service.createStudentFeedback(42, createDto, 7);

      expect(studentsRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 42 });
      expect(mentorsRepository.findOneByOrFail).toHaveBeenCalledWith({ userId: 7, courseId: 5 });
      expect(studentFeedbacksRepository.save).toHaveBeenCalledWith({
        studentId: 42,
        mentorId: 8,
        auhtorId: 7,
        content: createDto.content,
        recommendation: createDto.recommendation,
        englishLevel: createDto.englishLevel,
      });
      expect(result).toEqual({ id: 100 });
    });

    it('throws BadRequestException when a feedback already exists', async () => {
      studentsRepository.findOneByOrFail.mockResolvedValue({ id: 42, courseId: 5 });
      mentorsRepository.findOneByOrFail.mockResolvedValue({ id: 8 });
      studentFeedbacksRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: { id: 99 } }));

      await expect(service.createStudentFeedback(42, createDto, 7)).rejects.toThrow(BadRequestException);
      expect(studentFeedbacksRepository.save).not.toHaveBeenCalled();
    });

    it('propagates EntityNotFoundError when the student is missing', async () => {
      studentsRepository.findOneByOrFail.mockRejectedValue(new EntityNotFoundError(Student, {}));

      await expect(service.createStudentFeedback(42, createDto, 7)).rejects.toThrow(EntityNotFoundError);
      expect(mentorsRepository.findOneByOrFail).not.toHaveBeenCalled();
    });

    it('propagates EntityNotFoundError when the mentor is missing', async () => {
      studentsRepository.findOneByOrFail.mockResolvedValue({ id: 42, courseId: 5 });
      mentorsRepository.findOneByOrFail.mockRejectedValue(new EntityNotFoundError(Mentor, {}));

      await expect(service.createStudentFeedback(42, createDto, 7)).rejects.toThrow(EntityNotFoundError);
      expect(studentFeedbacksRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('saves the updated fields and returns the reloaded record', async () => {
      const dto: UpdateStudentFeedbackDto = {
        content: { suggestions: 's2', recommendationComment: 'c2', softSkills: [] },
        recommendation: 'hire',
        englishLevel: 'c1',
      } as never;
      studentFeedbacksRepository.save.mockResolvedValue({ id: 100 });
      studentFeedbacksRepository.createQueryBuilder.mockReturnValue(createQb({ getOneOrFail: { id: 100 } }));

      const result = await service.update(100, dto);

      expect(studentFeedbacksRepository.save).toHaveBeenCalledWith({
        id: 100,
        content: dto.content,
        recommendation: dto.recommendation,
        englishLevel: dto.englishLevel,
      });
      expect(result).toEqual({ id: 100 });
    });
  });

  describe('getById', () => {
    it('queries by id and returns the record', async () => {
      const qb = createQb({ getOneOrFail: { id: 100 } });
      studentFeedbacksRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getById(100);

      expect(qb.where).toHaveBeenCalledWith('f.id = :id', { id: 100 });
      expect(result).toEqual({ id: 100 });
    });

    it('propagates EntityNotFoundError when the feedback is missing', async () => {
      studentFeedbacksRepository.createQueryBuilder.mockReturnValue(createQb({}));

      await expect(service.getById(100)).rejects.toThrow(EntityNotFoundError);
    });
  });

  describe('getByStudentAndMentor', () => {
    it('returns the feedback filtered by student and mentor', async () => {
      const qb = createQb({ getOne: { id: 100 } });
      studentFeedbacksRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getByStudentAndMentor(42, 8);

      expect(qb.where).toHaveBeenCalledWith('f.studentId = :studentId', { studentId: 42 });
      expect(qb.andWhere).toHaveBeenCalledWith('f.mentorId = :mentorId', { mentorId: 8 });
      expect(result).toEqual({ id: 100 });
    });

    it('returns null when no feedback matches', async () => {
      studentFeedbacksRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: null }));

      const result = await service.getByStudentAndMentor(42, 8);

      expect(result).toBeNull();
    });
  });
});
