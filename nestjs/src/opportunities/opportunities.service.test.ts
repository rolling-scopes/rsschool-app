import { Feedback } from '@entities/feedback';
import { Resume } from '@entities/resume';
import { Student } from '@entities/student';
import { StudentFeedback } from '@entities/student-feedback';
import { User } from '@entities/user';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OpportunitiesService } from './opportunities.service';

describe('OpportunitiesService', () => {
  let service: OpportunitiesService;

  const resumeRepository = {
    findOneBy: vi.fn(),
    save: vi.fn(),
  };

  const feedbackRepository = {};
  const studentFeedbackRepository = {};

  const userRepository = {
    findOneOrFail: vi.fn(),
    update: vi.fn(),
  };

  const studentRepository = {};

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

  it('should prolong resume expiration by 30 days', async () => {
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

  it('should create consent and set expiration in 30 days', async () => {
    const fixedNow = new Date('2026-01-01T10:00:00.000Z');
    const expectedExpires = fixedNow.getTime() + 30 * 24 * 60 * 60 * 1000;

    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);

    userRepository.findOneOrFail.mockResolvedValueOnce({ id: 11 });
    userRepository.update.mockResolvedValueOnce(undefined);
    resumeRepository.findOneBy.mockResolvedValueOnce({ id: 7, githubId: 'john' });
    resumeRepository.save.mockImplementationOnce(async (data: { expires: number }) => ({
      expires: data.expires,
    }));

    const result = await service.createConsent('john');

    expect(result).toEqual({
      consent: true,
      expires: expectedExpires,
    });
    expect(userRepository.update).toHaveBeenCalledWith(11, { opportunitiesConsent: true });
  });
});
