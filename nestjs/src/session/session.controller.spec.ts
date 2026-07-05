import { Test, TestingModule } from '@nestjs/testing';
import { CurrentRequest } from 'src/auth';
import { SessionController } from './session.controller';

describe('SessionController', () => {
  let controller: SessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
    }).compile();

    controller = module.get(SessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSession', () => {
    it('returns the authenticated user from the request', () => {
      const user = { id: 1, githubId: 'johndoe' };
      const req = { user } as unknown as CurrentRequest;

      const result = controller.getSession(req);

      expect(result).toBe(user);
    });

    it('returns undefined when the request has no user', () => {
      const req = {} as CurrentRequest;

      const result = controller.getSession(req);

      expect(result).toBeUndefined();
    });
  });
});
