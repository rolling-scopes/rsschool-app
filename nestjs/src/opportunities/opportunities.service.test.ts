import { Feedback } from '@entities/feedback';
import { Resume } from '@entities/resume';
import { Student } from '@entities/student';
import { Recommendation, StudentFeedback } from '@entities/student-feedback';
import { User } from '@entities/user';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { OpportunitiesService } from './opportunities.service';

describe('OpportunitiesService', () => {
  let service: OpportunitiesService;

  const resumeRepository = {
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    findOneOrFail: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  const feedbackRepository = {
    find: vi.fn(),
  };

  const studentFeedbackRepository = {
    find: vi.fn(),
  };

  const userRepository = {
    findOne: vi.fn(),
    findOneOrFail: vi.fn(),
    update: vi.fn(),
  };

  const studentRepository = {
    find: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunitiesService,
        { provide: getRepositoryToken(Resume), useValue: resumeRepository },
        { provide: getRepositoryToken(Feedback), useValue: feedbackRepository },
        { provide: getRepositoryToken(StudentFeedback), useValue: studentFeedbackRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Student), useValue: studentRepository },
      ],
    }).compile();

    service = module.get<OpportunitiesService>(OpportunitiesService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getResumeByUuid', () => {
    it('loads resume by uuid then assembles full resume with visible courses filter', async () => {
      const resume = { userId: 3, visibleCourses: [10, 20] } as Partial<Resume> as Resume;
      const students = [{ id: 1 }, { id: 2 }] as Partial<Student>[] as Student[];
      const gratitudes = [{ id: 9 }] as Partial<Feedback>[] as Feedback[];
      const feedbacks = [{ id: 7 }] as Partial<StudentFeedback>[] as StudentFeedback[];

      resumeRepository.findOneOrFail.mockResolvedValueOnce(resume);
      studentRepository.find.mockResolvedValueOnce(students);
      feedbackRepository.find.mockResolvedValueOnce(gratitudes);
      studentFeedbackRepository.find.mockResolvedValueOnce(feedbacks);

      const result = await service.getResumeByUuid('abc-uuid');

      expect(resumeRepository.findOneOrFail).toHaveBeenCalledWith({ where: { uuid: 'abc-uuid' } });
      // visibleCourseOnly defaults to true and visibleCourses is non-empty => filter by courseId
      expect(studentRepository.find).toHaveBeenCalledWith({
        relations: ['course', 'certificate', 'mentor', 'mentor.user'],
        where: { userId: 3, courseId: In([10, 20]) },
      });
      expect(feedbackRepository.find).toHaveBeenCalledWith({
        where: { toUserId: 3 },
        order: { createdDate: 'DESC' },
      });
      expect(studentFeedbackRepository.find).toHaveBeenCalledWith({
        relations: ['student', 'student.course', 'mentor', 'mentor.user'],
        where: { studentId: In([1, 2]), recommendation: Recommendation.Hire },
      });
      expect(result).toEqual({ resume, students, gratitudes, feedbacks });
    });

    it('does not apply course filter when visibleCourses is empty', async () => {
      const resume = { userId: 3, visibleCourses: [] } as Partial<Resume> as Resume;
      resumeRepository.findOneOrFail.mockResolvedValueOnce(resume);
      studentRepository.find.mockResolvedValueOnce([]);
      feedbackRepository.find.mockResolvedValueOnce([]);
      studentFeedbackRepository.find.mockResolvedValueOnce([]);

      await service.getResumeByUuid('abc-uuid');

      expect(studentRepository.find).toHaveBeenCalledWith({
        relations: ['course', 'certificate', 'mentor', 'mentor.user'],
        where: { userId: 3 },
      });
    });

    it('returns empty students and gratitudes when resume has no userId', async () => {
      const resume = { userId: null, visibleCourses: [] } as Partial<Resume> as Resume;
      resumeRepository.findOneOrFail.mockResolvedValueOnce(resume);
      studentFeedbackRepository.find.mockResolvedValueOnce([]);

      const result = await service.getResumeByUuid('abc-uuid');

      expect(studentRepository.find).not.toHaveBeenCalled();
      expect(feedbackRepository.find).not.toHaveBeenCalled();
      expect(studentFeedbackRepository.find).toHaveBeenCalledWith({
        relations: ['student', 'student.course', 'mentor', 'mentor.user'],
        where: { studentId: In([]), recommendation: Recommendation.Hire },
      });
      expect(result).toEqual({ resume, students: [], gratitudes: [], feedbacks: [] });
    });
  });

  describe('getResumeByGithubId', () => {
    it('returns null when no resume exists for the user', async () => {
      userRepository.findOneOrFail.mockResolvedValueOnce({ id: 42 });
      resumeRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.getResumeByGithubId('john');

      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({ where: { githubId: 'john' } });
      expect(resumeRepository.findOne).toHaveBeenCalledWith({ where: { userId: 42 } });
      expect(result).toBeNull();
    });

    it('assembles full resume without visible course filter (visibleCourseOnly=false)', async () => {
      const resume = { userId: 42, visibleCourses: [10, 20] } as Partial<Resume> as Resume;
      userRepository.findOneOrFail.mockResolvedValueOnce({ id: 42 });
      resumeRepository.findOne.mockResolvedValueOnce(resume);
      studentRepository.find.mockResolvedValueOnce([{ id: 5 }] as Partial<Student>[] as Student[]);
      feedbackRepository.find.mockResolvedValueOnce([]);
      studentFeedbackRepository.find.mockResolvedValueOnce([]);

      await service.getResumeByGithubId('john');

      // visibleCourseOnly=false => no courseId filter even though visibleCourses is set
      expect(studentRepository.find).toHaveBeenCalledWith({
        relations: ['course', 'certificate', 'mentor', 'mentor.user'],
        where: { userId: 42 },
      });
    });
  });

  describe('saveResume', () => {
    it('returns null when no resume exists for githubId', async () => {
      resumeRepository.findOneBy.mockResolvedValueOnce(null);

      const result = await service.saveResume('john', { name: 'New' } as never);

      expect(resumeRepository.findOneBy).toHaveBeenCalledWith({ githubId: 'john' });
      expect(resumeRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('merges dto onto existing resume and saves', async () => {
      const existing = { id: 1, githubId: 'john', name: 'Old', email: 'a@b.c' } as Partial<Resume> as Resume;
      resumeRepository.findOneBy.mockResolvedValueOnce(existing);
      resumeRepository.save.mockImplementationOnce(async (data: unknown) => data);

      const result = await service.saveResume('john', { name: 'New' } as never);

      expect(resumeRepository.save).toHaveBeenCalledWith({
        id: 1,
        githubId: 'john',
        name: 'New',
        email: 'a@b.c',
      });
      expect(result).toEqual({ id: 1, githubId: 'john', name: 'New', email: 'a@b.c' });
    });
  });

  describe('getApplicantResumes', () => {
    it('queries consented applicants with a non-null name', async () => {
      const expected = [{ id: 1 }] as Partial<Resume>[] as Resume[];
      const qb = {
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(expected),
      };
      resumeRepository.createQueryBuilder.mockReturnValueOnce(qb);

      const result = await service.getApplicantResumes();

      expect(resumeRepository.createQueryBuilder).toHaveBeenCalledWith('r');
      expect(qb.innerJoin).toHaveBeenCalledWith('r.user', 'u');
      expect(qb.where).toHaveBeenCalledWith('u."opportunitiesConsent" = true');
      expect(qb.andWhere).toHaveBeenCalledWith('r.name IS NOT NULL');
      expect(qb.addSelect).toHaveBeenCalledWith(['u.id', 'u.githubId']);
      expect(result).toBe(expected);
    });
  });

  describe('prolong', () => {
    it('prolongs resume expiration by 30 days', async () => {
      const fixedNow = new Date('2026-01-01T10:00:00.000Z');
      const expectedExpires = fixedNow.getTime() + 30 * 24 * 60 * 60 * 1000;

      vi.useFakeTimers();
      vi.setSystemTime(fixedNow);

      resumeRepository.findOneBy.mockResolvedValueOnce({ id: 5, githubId: 'john' });
      resumeRepository.save.mockImplementationOnce(async (data: { expires: number }) => ({
        id: 5,
        githubId: 'john',
        expires: data.expires,
      }));

      const expires = await service.prolong('john');

      expect(expires).toBe(expectedExpires);
      expect(resumeRepository.save).toHaveBeenCalledWith({
        id: 5,
        githubId: 'john',
        expires: expectedExpires,
      });
    });

    it('saves with undefined id when no resume exists', async () => {
      const fixedNow = new Date('2026-01-01T10:00:00.000Z');
      const expectedExpires = fixedNow.getTime() + 30 * 24 * 60 * 60 * 1000;

      vi.useFakeTimers();
      vi.setSystemTime(fixedNow);

      resumeRepository.findOneBy.mockResolvedValueOnce(null);
      resumeRepository.save.mockImplementationOnce(async (data: { expires: number }) => ({ expires: data.expires }));

      await service.prolong('john');

      expect(resumeRepository.save).toHaveBeenCalledWith({
        id: undefined,
        githubId: 'john',
        expires: expectedExpires,
      });
    });
  });

  describe('setVisibility', () => {
    it('persists isHidden=false when visible and returns saved value', async () => {
      resumeRepository.findOneBy.mockResolvedValueOnce({ id: 3, githubId: 'john' });
      resumeRepository.save.mockImplementationOnce(async (data: { isHidden: boolean }) => ({
        isHidden: data.isHidden,
      }));

      const result = await service.setVisibility('john', true);

      expect(resumeRepository.save).toHaveBeenCalledWith({ id: 3, githubId: 'john', isHidden: false });
      expect(result).toBe(false);
    });

    it('persists isHidden=true when not visible', async () => {
      resumeRepository.findOneBy.mockResolvedValueOnce(null);
      resumeRepository.save.mockImplementationOnce(async (data: { isHidden: boolean }) => ({
        isHidden: data.isHidden,
      }));

      const result = await service.setVisibility('john', false);

      expect(resumeRepository.save).toHaveBeenCalledWith({ id: undefined, githubId: 'john', isHidden: true });
      expect(result).toBe(true);
    });
  });

  describe('getConsent', () => {
    it('returns false when user is not found', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.getConsent('john');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { githubId: 'john' } });
      expect(result).toBe(false);
    });

    it('returns boolean consent value when user exists', async () => {
      userRepository.findOne.mockResolvedValueOnce({ opportunitiesConsent: true });

      const result = await service.getConsent('john');

      expect(result).toBe(true);
    });

    it('coerces a nullish consent into false', async () => {
      userRepository.findOne.mockResolvedValueOnce({ opportunitiesConsent: null });

      const result = await service.getConsent('john');

      expect(result).toBe(false);
    });
  });

  describe('createConsent', () => {
    it('creates consent and sets expiration in 30 days', async () => {
      const fixedNow = new Date('2026-01-01T10:00:00.000Z');
      const expectedExpires = fixedNow.getTime() + 30 * 24 * 60 * 60 * 1000;

      vi.useFakeTimers();
      vi.setSystemTime(fixedNow);

      userRepository.findOneOrFail.mockResolvedValueOnce({ id: 11 });
      userRepository.update.mockResolvedValueOnce(undefined);
      resumeRepository.findOneBy.mockResolvedValueOnce({ id: 7, githubId: 'john' });
      resumeRepository.save.mockImplementationOnce(async (data: { expires: number }) => ({ expires: data.expires }));

      const result = await service.createConsent('john');

      expect(result).toEqual({ consent: true, expires: expectedExpires });
      expect(userRepository.update).toHaveBeenCalledWith(11, { opportunitiesConsent: true });
      expect(resumeRepository.save).toHaveBeenCalledWith({
        id: 7,
        githubId: 'john',
        userId: 11,
        expires: expectedExpires,
      });
    });

    it('creates resume with undefined id when none exists yet', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T10:00:00.000Z'));

      userRepository.findOneOrFail.mockResolvedValueOnce({ id: 11 });
      userRepository.update.mockResolvedValueOnce(undefined);
      resumeRepository.findOneBy.mockResolvedValueOnce(null);
      resumeRepository.save.mockImplementationOnce(async (data: { expires: number }) => ({ expires: data.expires }));

      await service.createConsent('john');

      expect(resumeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: undefined, githubId: 'john', userId: 11 }),
      );
    });
  });

  describe('deleteConsent', () => {
    it('clears consent flag, deletes the resume and returns false', async () => {
      userRepository.findOneOrFail.mockResolvedValueOnce({ id: 11 });
      userRepository.update.mockResolvedValueOnce(undefined);
      resumeRepository.delete.mockResolvedValueOnce(undefined);

      const result = await service.deleteConsent('john');

      expect(userRepository.update).toHaveBeenCalledWith(11, { opportunitiesConsent: false });
      expect(resumeRepository.delete).toHaveBeenCalledWith({ githubId: 'john' });
      expect(result).toBe(false);
    });
  });
});
