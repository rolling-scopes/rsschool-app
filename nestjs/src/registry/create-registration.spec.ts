import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MentorRegistry } from '@entities/mentorRegistry';
import { Student } from '@entities/student';
import { Registry } from '@entities/registry';
import { Mentor } from '@entities/mentor';
import { User } from '@entities/user';
import { Course } from '@entities/course';
import { RegistryService } from './registry.service';
import { UsersService } from 'src/users/users.service';
import { CoursesService } from 'src/courses/courses.service';
import { NotificationsService } from 'src/notifications/notifications.service';

// Fixtures mirrored from server/src/routes/registry/__test__/createRegistration.test.ts to prove business-logic equivalence
const mockUser = { id: 11, githubId: 'john-doe', mentors: [], students: [] };
const mockCourse = { id: 5 };
const authUser = { id: 11, githubId: 'john-doe' };

const userRepository = { findOne: vi.fn() };
const courseRepository = { findOneBy: vi.fn() };
const registryRepository = { findOne: vi.fn(), save: vi.fn(), find: vi.fn() };
const studentRepository = { save: vi.fn() };
const mentorRepository = { save: vi.fn(), findOne: vi.fn() };

const setupRepos = ({
  user = { ...mockUser },
  course = { ...mockCourse },
  existingRegistry = null as unknown,
} = {}) => {
  userRepository.findOne.mockResolvedValue(user);
  courseRepository.findOneBy.mockResolvedValue(course);
  registryRepository.findOne.mockResolvedValue(existingRegistry);
  registryRepository.save.mockImplementation(async (payload: object) => ({ id: 99, ...payload }));
  studentRepository.save.mockResolvedValue({});
  mentorRepository.save.mockResolvedValue({});
};

describe('RegistryService.createRegistration', () => {
  let service: RegistryService;

  beforeEach(async () => {
    [userRepository, courseRepository, registryRepository, studentRepository, mentorRepository].forEach(repo =>
      Object.values(repo).forEach(fn => fn.mockReset()),
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistryService,
        { provide: getRepositoryToken(MentorRegistry), useValue: {} },
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        { provide: getRepositoryToken(Registry), useValue: registryRepository },
        { provide: getRepositoryToken(Mentor), useValue: mentorRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Course), useValue: courseRepository },
        { provide: UsersService, useValue: {} },
        { provide: CoursesService, useValue: {} },
        { provide: NotificationsService, useValue: {} },
      ],
    }).compile();

    service = module.get(RegistryService);
  });

  it('rejects payload without courseId or type', async () => {
    setupRepos();

    await expect(service.createRegistration(authUser, { type: 'student' } as never)).rejects.toThrow(
      'Wrong payload: githubId courseId & type are required',
    );
  });

  it('rejects mentor registration with maxStudentsLimit below 2', async () => {
    setupRepos();

    await expect(
      service.createRegistration(authUser, { courseId: 5, type: 'mentor', maxStudentsLimit: 1 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns existing registry without creating a new one', async () => {
    const existingRegistry = { id: 77, userId: 11, courseId: 5, status: 'pending' };
    setupRepos({ existingRegistry });

    const result = await service.createRegistration(authUser, { courseId: 5, type: 'student' });

    expect(registryRepository.save).not.toHaveBeenCalled();
    expect(result).toBe(existingRegistry);
  });

  it('registers student as approved and enrolls into the course', async () => {
    setupRepos();

    await service.createRegistration(authUser, { courseId: 5, type: 'student' });

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { githubId: 'john-doe' },
      relations: ['mentors', 'students'],
    });
    expect(courseRepository.findOneBy).toHaveBeenCalledWith({ id: 5 });
    expect(registryRepository.findOne).toHaveBeenCalledWith({ where: { userId: 11, courseId: 5 } });
    expect(studentRepository.save).toHaveBeenCalledWith({ userId: 11, courseId: 5, startDate: expect.any(Date) });
    expect(registryRepository.save).toHaveBeenCalledWith({
      type: 'student',
      user: expect.objectContaining({ id: 11 }),
      course: mockCourse,
      status: 'approved',
    });
  });

  it('does not enroll student again when already enrolled in the course', async () => {
    setupRepos({ user: { ...mockUser, students: [{ courseId: 5 }] } });

    await service.createRegistration(authUser, { courseId: 5, type: 'student' });

    expect(studentRepository.save).not.toHaveBeenCalled();
  });

  it('auto-approves mentor with existing mentor records and creates course mentor', async () => {
    setupRepos({ user: { ...mockUser, mentors: [{ id: 1 }] } });

    await service.createRegistration(authUser, {
      courseId: 5,
      type: 'mentor',
      maxStudentsLimit: 3,
      experienceInYears: '2',
    });

    expect(mentorRepository.save).toHaveBeenCalledWith({ userId: 11, courseId: 5, maxStudentsLimit: 3 });
    expect(registryRepository.save).toHaveBeenCalledWith({
      type: 'mentor',
      user: expect.objectContaining({ id: 11 }),
      course: mockCourse,
      status: 'approved',
      attributes: { maxStudentsLimit: 3, experienceInYears: '2' },
    });
  });

  it('keeps new mentor pending without creating course mentor', async () => {
    setupRepos();

    await service.createRegistration(authUser, {
      courseId: 5,
      type: 'mentor',
      maxStudentsLimit: 3,
      experienceInYears: '2',
    });

    expect(mentorRepository.save).not.toHaveBeenCalled();
    expect(registryRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'mentor', status: 'pending' }),
    );
  });
});
