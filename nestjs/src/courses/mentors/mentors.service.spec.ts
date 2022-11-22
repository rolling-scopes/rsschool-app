import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MentorsService } from './mentors.service';
import { Mentor, Student, TaskChecker, TaskSolution } from '@entities/index';

describe('MentorsService', () => {
  let service: MentorsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentorsService,
        {
          provide: getRepositoryToken(Mentor),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Student),
          useValue: {},
        },
        {
          provide: getRepositoryToken(TaskSolution),
          useValue: {},
        },
        {
          provide: getRepositoryToken(TaskChecker),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<MentorsService>(MentorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
