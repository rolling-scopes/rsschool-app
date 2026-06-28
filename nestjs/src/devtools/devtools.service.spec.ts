import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@entities/user';
import { DevtoolsService } from './devtools.service';
import { ConfigService } from '../config';

describe('DevtoolsService', () => {
  let service: DevtoolsService;
  let userRepository: Mocked<Repository<User>>;
  let configService: Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevtoolsService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: vi.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            authWithDevUser: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DevtoolsService>(DevtoolsService);
    userRepository = module.get(getRepositoryToken(User));
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsers', () => {
    it('queries users with their student/mentor course relations', async () => {
      userRepository.find.mockResolvedValue([]);

      await service.getUsers();

      expect(userRepository.find).toHaveBeenCalledWith({
        select: {
          id: true,
          githubId: true,
          students: {
            courseId: true,
            course: { alias: true },
          },
          mentors: {
            courseId: true,
            course: { alias: true },
          },
        },
        relations: ['students.course', 'mentors.course'],
      });
    });

    it('maps mentor and student course aliases and passes through raw students', async () => {
      const students = [{ course: { alias: 'js-2026' } }, { course: { alias: 'react-2026' } }];
      const mentors = [{ course: { alias: 'node-2026' } }];
      userRepository.find.mockResolvedValue([{ id: 1, githubId: 'john-doe', students, mentors }] as unknown as User[]);

      const result = await service.getUsers();

      expect(result).toEqual([
        {
          id: 1,
          githubId: 'john-doe',
          mentor: ['node-2026'],
          student: ['js-2026', 'react-2026'],
          students,
        },
      ]);
    });

    it('falls back to empty arrays when mentors and students are missing', async () => {
      userRepository.find.mockResolvedValue([
        { id: 2, githubId: 'jane-doe', students: undefined, mentors: undefined },
      ] as unknown as User[]);

      const result = await service.getUsers();

      expect(result).toEqual([
        {
          id: 2,
          githubId: 'jane-doe',
          mentor: [],
          student: [],
          students: undefined,
        },
      ]);
    });

    it('maps an undefined course alias when course relation is absent', async () => {
      userRepository.find.mockResolvedValue([
        {
          id: 3,
          githubId: 'no-course',
          students: [{ course: undefined }],
          mentors: [{ course: undefined }],
        },
      ] as unknown as User[]);

      const result = await service.getUsers();

      expect(result[0].mentor).toEqual([undefined]);
      expect(result[0].student).toEqual([undefined]);
    });
  });

  describe('getDevUserLogin', () => {
    it('delegates to ConfigService.authWithDevUser with the githubId', async () => {
      await service.getDevUserLogin({ githubId: 'john-doe' });

      expect(configService.authWithDevUser).toHaveBeenCalledWith('john-doe');
    });

    it('resolves to undefined', async () => {
      const result = await service.getDevUserLogin({ githubId: 'john-doe' });

      expect(result).toBeUndefined();
    });
  });
});
