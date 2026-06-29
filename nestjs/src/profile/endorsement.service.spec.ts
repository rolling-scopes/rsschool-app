import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Course } from '@entities/course';
import { Mentor, Student, TaskInterviewResult, User, Feedback } from '@entities/index';
import { Prompt } from '@entities/prompt';
import { ConfigService } from 'src/config';
import { EndorsementService } from './endorsement.service';

// OpenAI is instantiated in the constructor, so the module must be mocked.
const openAiCreate = vi.fn();
vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create: openAiCreate } };
  },
}));

const mockUser = { id: 7, githubId: 'john-doe', firstName: 'John', lastName: 'Doe' } as Partial<User> as User;
const mockMentor = { id: 21, userId: 7, courseId: 5 } as Partial<Mentor> as Mentor;
const mockCourse = { id: 5, name: 'RS 2024', discipline: { id: 1, name: 'JS' } } as Partial<Course> as Course;
const mockFeedback = { id: 1, toUserId: 7, comment: 'great' } as Partial<Feedback> as Feedback;
const mockPrompt = {
  type: 'endorsement',
  text: 'Hello {{user.firstName}}',
  temperature: 0.5,
} as Partial<Prompt> as Prompt;

describe('EndorsementService', () => {
  let service: EndorsementService;
  let courseRepository: Mocked<{ find: ReturnType<typeof vi.fn> }>;
  let mentorRepository: Mocked<{ find: ReturnType<typeof vi.fn> }>;
  let studentRepository: Mocked<{ count: ReturnType<typeof vi.fn> }>;
  let promptRepository: Mocked<{ findOne: ReturnType<typeof vi.fn> }>;
  let feedbackRepository: Mocked<{ find: ReturnType<typeof vi.fn> }>;
  let userRepository: Mocked<{ findOne: ReturnType<typeof vi.fn> }>;
  let taskInterviewResultRepository: Mocked<{ count: ReturnType<typeof vi.fn> }>;

  beforeEach(async () => {
    openAiCreate.mockReset();
    courseRepository = { find: vi.fn() };
    mentorRepository = { find: vi.fn() };
    studentRepository = { count: vi.fn() };
    promptRepository = { findOne: vi.fn() };
    feedbackRepository = { find: vi.fn() };
    userRepository = { findOne: vi.fn() };
    taskInterviewResultRepository = { count: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EndorsementService,
        { provide: getRepositoryToken(Course), useValue: courseRepository },
        { provide: getRepositoryToken(Mentor), useValue: mentorRepository },
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        { provide: getRepositoryToken(Prompt), useValue: promptRepository },
        { provide: getRepositoryToken(Feedback), useValue: feedbackRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(TaskInterviewResult), useValue: taskInterviewResultRepository },
        { provide: ConfigService, useValue: { openai: { apiKey: 'test-key' } } },
      ],
    }).compile();

    service = module.get(EndorsementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEndorsmentData', () => {
    it('aggregates user, mentors, courses, feedbacks and the student/interview counts', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      mentorRepository.find.mockResolvedValue([mockMentor]);
      feedbackRepository.find.mockResolvedValue([mockFeedback]);
      courseRepository.find.mockResolvedValue([mockCourse]);
      studentRepository.count.mockResolvedValue(3);
      taskInterviewResultRepository.count.mockResolvedValue(2);

      const data = await service.getEndorsmentData('john-doe');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { githubId: 'john-doe' } });
      expect(mentorRepository.find).toHaveBeenCalledWith({ where: { userId: 7 } });
      expect(feedbackRepository.find).toHaveBeenCalledWith({ where: { toUserId: 7 } });
      // courses queried by the mentor course ids with discipline relation
      expect(courseRepository.find).toHaveBeenCalledWith(expect.objectContaining({ relations: ['discipline'] }));
      expect(data).toEqual({
        user: mockUser,
        courses: [mockCourse],
        mentors: [mockMentor],
        studentsCount: 3,
        interviewsCount: 2,
        feedbacks: [mockFeedback],
      });
    });

    it('throws NotFoundException when the user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.getEndorsmentData('ghost')).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.getEndorsmentData('ghost')).rejects.toThrow('User with githubId ghost not found');
      expect(mentorRepository.find).not.toHaveBeenCalled();
    });

    it('counts students and interviews against the mentor ids', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      mentorRepository.find.mockResolvedValue([mockMentor, { id: 22, userId: 7, courseId: 6 } as Mentor]);
      feedbackRepository.find.mockResolvedValue([]);
      courseRepository.find.mockResolvedValue([]);
      studentRepository.count.mockResolvedValue(0);
      taskInterviewResultRepository.count.mockResolvedValue(0);

      await service.getEndorsmentData('john-doe');

      const studentWhere = studentRepository.count.mock.calls[0][0].where;
      const interviewWhere = taskInterviewResultRepository.count.mock.calls[0][0].where;
      // In(...) is opaque, so assert the count was invoked with a mentorId filter object.
      expect(studentWhere).toHaveProperty('mentorId');
      expect(interviewWhere).toHaveProperty('mentorId');
    });
  });

  describe('getEndorsementPrompt', () => {
    it('returns null and warns when there is no prompt text', async () => {
      promptRepository.findOne.mockResolvedValue({ type: 'endorsement', text: '' } as Prompt);
      vi.spyOn(service, 'getEndorsmentData').mockResolvedValue({
        user: mockUser,
        courses: [],
        mentors: [mockMentor],
        studentsCount: 0,
        interviewsCount: 0,
        feedbacks: [],
      } as never);

      const result = await service.getEndorsementPrompt('john-doe');

      expect(result).toBeNull();
    });

    it('returns null when the user has no mentors', async () => {
      promptRepository.findOne.mockResolvedValue(mockPrompt);
      vi.spyOn(service, 'getEndorsmentData').mockResolvedValue({
        user: mockUser,
        courses: [],
        mentors: [],
        studentsCount: 0,
        interviewsCount: 0,
        feedbacks: [],
      } as never);

      const result = await service.getEndorsementPrompt('john-doe');

      expect(result).toBeNull();
    });

    it('compiles the handlebars prompt with the endorsement data when prompt and mentors exist', async () => {
      promptRepository.findOne.mockResolvedValue(mockPrompt);
      const data = {
        user: mockUser,
        courses: [mockCourse],
        mentors: [mockMentor],
        studentsCount: 1,
        interviewsCount: 1,
        feedbacks: [mockFeedback],
      };
      vi.spyOn(service, 'getEndorsmentData').mockResolvedValue(data as never);

      const result = await service.getEndorsementPrompt('john-doe');

      expect(promptRepository.findOne).toHaveBeenCalledWith({ where: { type: 'endorsement' } });
      expect(result).toEqual({ text: 'Hello John', temperature: 0.5, data });
    });
  });

  describe('getEndorsement', () => {
    it('returns null when there is no prompt', async () => {
      vi.spyOn(service, 'getEndorsementPrompt').mockResolvedValue(null);

      const result = await service.getEndorsement('john-doe');

      expect(result).toBeNull();
      expect(openAiCreate).not.toHaveBeenCalled();
    });

    it('calls OpenAI and returns the generated content with the prompt data', async () => {
      const data = { user: mockUser } as never;
      vi.spyOn(service, 'getEndorsementPrompt').mockResolvedValue({ text: 'compiled', temperature: 0.3, data });
      openAiCreate.mockResolvedValue({ choices: [{ message: { content: 'Generated endorsement' } }] });

      const result = await service.getEndorsement('john-doe');

      expect(openAiCreate).toHaveBeenCalledWith({
        model: 'gpt-5',
        messages: [{ role: 'user', content: 'compiled' }],
      });
      expect(result).toEqual({ content: 'Generated endorsement', data });
    });

    it('defaults content to an empty string when OpenAI returns no message content', async () => {
      const data = {} as never;
      vi.spyOn(service, 'getEndorsementPrompt').mockResolvedValue({ text: 'compiled', temperature: 0.3, data });
      openAiCreate.mockResolvedValue({ choices: [{}] });

      const result = await service.getEndorsement('john-doe');

      expect(result).toEqual({ content: '', data });
    });

    it('returns null and swallows the error when the prompt lookup throws', async () => {
      vi.spyOn(service, 'getEndorsementPrompt').mockRejectedValue(new Error('boom'));

      const result = await service.getEndorsement('john-doe');

      expect(result).toBeNull();
      expect(openAiCreate).not.toHaveBeenCalled();
    });

    it('returns null and swallows the error when OpenAI throws', async () => {
      vi.spyOn(service, 'getEndorsementPrompt').mockResolvedValue({
        text: 'compiled',
        temperature: 0.3,
        data: {} as never,
      });
      openAiCreate.mockRejectedValue(new Error('openai down'));

      const result = await service.getEndorsement('john-doe');

      expect(result).toBeNull();
    });
  });
});
