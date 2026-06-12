import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MentorRegistry } from '@entities/mentorRegistry';
import { Student } from '@entities/student';
import { Registry } from '@entities/registry';
import { Mentor } from '@entities/mentor';
import { RegistryService } from './registry.service';
import { UsersService } from 'src/users/users.service';
import { CoursesService } from 'src/courses/courses.service';
import { NotificationsService } from 'src/notifications/notifications.service';

// Fixtures mirrored from server/src/routes/registry/__test__/registrations.test.ts to prove business-logic equivalence
const mockRegistrations = [
  {
    id: 1,
    type: 'mentor',
    status: 'pending',
    userId: 11,
    courseId: 5,
    attributes: { maxStudentsLimit: 3 },
    user: { githubId: 'john-doe', firstName: 'John', lastName: 'Doe' },
    course: { id: 5 },
  },
];

const registryRepository = { find: vi.fn(), findOne: vi.fn(), save: vi.fn() };
const mentorRepository = { findOne: vi.fn(), save: vi.fn() };

describe('registrations', () => {
  let service: RegistryService;

  beforeEach(async () => {
    Object.values(registryRepository).forEach(fn => fn.mockReset());
    Object.values(mentorRepository).forEach(fn => fn.mockReset());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistryService,
        { provide: getRepositoryToken(MentorRegistry), useValue: {} },
        { provide: getRepositoryToken(Student), useValue: {} },
        { provide: getRepositoryToken(Registry), useValue: registryRepository },
        { provide: getRepositoryToken(Mentor), useValue: mentorRepository },
        { provide: UsersService, useValue: {} },
        { provide: CoursesService, useValue: {} },
        { provide: NotificationsService, useValue: {} },
      ],
    }).compile();

    service = module.get(RegistryService);
  });

  describe('getRegistrations', () => {
    it('loads first 1000 registrations of requested type and course with user and course relations', async () => {
      registryRepository.find.mockResolvedValue(mockRegistrations);

      const result = await service.getRegistrations(undefined, 5);

      expect(registryRepository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 1000,
        order: { id: 'ASC' },
        relations: ['user', 'course'],
        where: [{ type: 'mentor', course: { id: 5 } }],
      });
      expect(result).toBe(mockRegistrations);
    });
  });

  describe('updateRegistrations', () => {
    it('updates statuses, skips missing registries and creates mentors on approval when missing', async () => {
      registryRepository.findOne.mockResolvedValueOnce(mockRegistrations[0]).mockResolvedValueOnce(null);
      registryRepository.save.mockResolvedValue({});
      const newMentor = { id: 100, userId: 11, courseId: 5, maxStudentsLimit: 3 };
      mentorRepository.findOne.mockResolvedValue(null);
      mentorRepository.save.mockResolvedValue(newMentor);

      const result = await service.updateRegistrations([1, 2], 'approved');

      expect(registryRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['course'] });
      expect(registryRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 }, relations: ['course'] });
      expect(registryRepository.save).toHaveBeenCalledTimes(1);
      expect(registryRepository.save).toHaveBeenCalledWith({ ...mockRegistrations[0], status: 'approved' });
      expect(mentorRepository.findOne).toHaveBeenCalledWith({ where: { userId: 11, courseId: 5 } });
      expect(mentorRepository.save).toHaveBeenCalledWith({ userId: 11, courseId: 5, maxStudentsLimit: 3 });
      expect(result).toEqual({ registries: [newMentor] });
    });

    it('returns existing mentor without creating a new one', async () => {
      const existingMentor = { id: 50, userId: 11, courseId: 5, maxStudentsLimit: 2 };
      registryRepository.findOne.mockResolvedValue(mockRegistrations[0]);
      registryRepository.save.mockResolvedValue({});
      mentorRepository.findOne.mockResolvedValue(existingMentor);

      const result = await service.updateRegistrations([1], 'approved');

      expect(mentorRepository.save).not.toHaveBeenCalled();
      expect(result).toEqual({ registries: [existingMentor] });
    });

    it('does not touch mentors when status is not approved', async () => {
      registryRepository.findOne.mockResolvedValue(mockRegistrations[0]);
      registryRepository.save.mockResolvedValue({});

      const result = await service.updateRegistrations([1], 'rejected');

      expect(registryRepository.save).toHaveBeenCalledWith({ ...mockRegistrations[0], status: 'rejected' });
      expect(mentorRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual({ registries: [] });
    });
  });
});
