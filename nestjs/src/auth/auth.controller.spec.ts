import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '.';
import { AuthController } from './auth.controller';
import { GithubStrategy } from './strategies/github.strategy';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: GithubStrategy, useValue: {} },
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
