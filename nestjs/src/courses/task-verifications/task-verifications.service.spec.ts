import { Test, TestingModule } from '@nestjs/testing';
import { TaskVerificationsService } from './task-verifications.service';

describe('TaskVerificationsService', () => {
  let service: TaskVerificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskVerificationsService],
    }).compile();

    service = module.get<TaskVerificationsService>(TaskVerificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
