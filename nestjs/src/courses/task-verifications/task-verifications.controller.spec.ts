import { Test, TestingModule } from '@nestjs/testing';
import { TaskVerificationsController } from './task-verifications.controller';

describe('TaskVerificationsController', () => {
  let controller: TaskVerificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskVerificationsController],
    }).compile();

    controller = module.get<TaskVerificationsController>(TaskVerificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
