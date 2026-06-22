import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { CoursesService } from 'src/courses/courses.service';
import { DisciplinesService } from 'src/disciplines/disciplines.service';

// Fixtures mirrored from server/src/routes/registry/__test__/getMentor.test.ts to prove business-logic equivalence
const mockMentorRegistry = {
  userId: 11,
  maxStudentsLimit: 4,
  preferedStudentsLocation: 'any',
  preselectedCourses: ['10', '20'],
  preferedCourses: ['30', '40'],
};

const mockGetOwnMentorRegistry = vi.fn();

describe('getOwnMentorRegistry', () => {
  let controller: RegistryController;

  beforeEach(async () => {
    mockGetOwnMentorRegistry.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistryController],
      providers: [
        { provide: RegistryService, useValue: { getOwnMentorRegistry: mockGetOwnMentorRegistry } },
        { provide: UserNotificationsService, useValue: {} },
        { provide: CoursesService, useValue: {} },
        { provide: DisciplinesService, useValue: {} },
      ],
    }).compile();

    controller = module.get(RegistryController);
  });

  it('returns own mentor registry mapped with numeric course ids', async () => {
    mockGetOwnMentorRegistry.mockResolvedValue(mockMentorRegistry);

    const result = await controller.getOwnMentorRegistry({ user: { id: 11 } } as never);

    expect(mockGetOwnMentorRegistry).toHaveBeenCalledWith(11);
    expect(result).toEqual({
      maxStudentsLimit: 4,
      preferedStudentsLocation: 'any',
      preselectedCourses: [10, 20],
      preferredCourses: [30, 40],
    });
  });

  it('responds with 404 when user has no mentor registry record', async () => {
    mockGetOwnMentorRegistry.mockResolvedValue(null);

    await expect(controller.getOwnMentorRegistry({ user: { id: 11 } } as never)).rejects.toThrow(NotFoundException);
  });
});
