import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryFailedError } from 'typeorm';
import { CourseTask, Mentor, TaskResult } from '@entities/index';
import { Student } from '@entities/student';
import { MentorRegistry } from '@entities/mentorRegistry';
import { User } from '@entities/user';
import { CourseMentorsService } from './course-mentors.service';

// Fixtures mirrored from server/src/routes/course/__test__/postMentor.test.ts to prove business-logic equivalence
const mockUser = { id: 100, githubId: 'john-doe' };
const plainSession = { id: 1, githubId: 'john-doe', isAdmin: false, courses: {} } as never;
const adminSession = { id: 1, githubId: 'john-doe', isAdmin: true, courses: {} } as never;

const mentorsRepository = { findOne: vi.fn(), insert: vi.fn(), update: vi.fn() };
const userRepository = { findOne: vi.fn() };
const registryRepository = { findOne: vi.fn() };
const studentRepository = { update: vi.fn() };

describe('CourseMentorsService.createMentor', () => {
  let service: CourseMentorsService;

  beforeEach(async () => {
    [mentorsRepository, userRepository, registryRepository, studentRepository].forEach(repo =>
      Object.values(repo).forEach(fn => fn.mockReset()),
    );
    userRepository.findOne.mockResolvedValue(mockUser);
    mentorsRepository.findOne.mockResolvedValue(null);
    mentorsRepository.insert.mockResolvedValue({ identifiers: [{ id: 9 }] });
    registryRepository.findOne.mockResolvedValue(null);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseMentorsService,
        { provide: getRepositoryToken(Mentor), useValue: mentorsRepository },
        { provide: getRepositoryToken(CourseTask), useValue: {} },
        { provide: getRepositoryToken(TaskResult), useValue: {} },
        {
          provide: DataSource,
          useValue: {
            getRepository: (entity: unknown) => {
              if (entity === User) return userRepository;
              if (entity === MentorRegistry) return registryRepository;
              if (entity === Student) return studentRepository;
              throw new Error('unexpected repo');
            },
          },
        },
      ],
    }).compile();
    service = module.get(CourseMentorsService);
  });

  it('responds 400 for unknown user', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.createMentor(plainSession, 5, 'john-doe', { students: [] })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('forbids creating a mentor without registry approval or power role', async () => {
    registryRepository.findOne.mockResolvedValue({ preselectedCourses: ['7'] });

    await expect(service.createMentor(plainSession, 5, 'john-doe', { students: [] })).rejects.toThrow(
      ForbiddenException,
    );
    expect(mentorsRepository.insert).not.toHaveBeenCalled();
  });

  it('creates a mentor approved via registry preselected courses and assigns students', async () => {
    registryRepository.findOne.mockResolvedValue({ preselectedCourses: ['5'] });

    await service.createMentor(plainSession, 5, 'john-doe', {
      students: [201, 202],
      maxStudentsLimit: 3,
      preferedStudentsLocation: 'any',
    });

    expect(mentorsRepository.insert).toHaveBeenCalledWith({
      courseId: 5,
      userId: 100,
      maxStudentsLimit: 3,
      studentsPreference: 'any',
    });
    expect(studentRepository.update).toHaveBeenCalledTimes(1);
    expect(studentRepository.update).toHaveBeenCalledWith([201, 202], { mentorId: 9 });
  });

  it('updates an existing mentor and relinks students', async () => {
    mentorsRepository.findOne.mockResolvedValue({ id: 7 });

    await service.createMentor(plainSession, 5, 'john-doe', { students: [201], maxStudentsLimit: 4 });

    expect(mentorsRepository.update).toHaveBeenCalledWith(7, { maxStudentsLimit: 4 });
    expect(studentRepository.update).toHaveBeenNthCalledWith(1, { mentorId: 7 }, { mentorId: null });
    expect(studentRepository.update).toHaveBeenNthCalledWith(2, [201], { mentorId: 7 });
  });

  it('responds 409 on concurrent registration (unique violation)', async () => {
    const err = new QueryFailedError('insert', [], { code: '23505' } as unknown as Error);
    mentorsRepository.insert.mockRejectedValue(err);

    await expect(service.createMentor(adminSession, 5, 'john-doe', { students: [] })).rejects.toThrow(
      ConflictException,
    );
  });

  it('skips student updates when no students provided', async () => {
    mentorsRepository.findOne.mockResolvedValue({ id: 7 });

    await service.createMentor(plainSession, 5, 'john-doe', { students: [] });

    expect(studentRepository.update).not.toHaveBeenCalled();
  });
});
