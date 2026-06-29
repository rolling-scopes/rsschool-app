import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import type { Request } from 'express';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '@entities/user';
import { CurrentRequest } from 'src/auth';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from 'src/config';
import { ActivityController } from './activity.controller';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CreateActivityWebhookDto } from './dto/create-activity-webhook.dto';

const WEBHOOK_SECRET = 'activity-webhook';

const mockUser = {
  id: 42,
  githubId: 'john-doe',
  lastActivityTime: 1700000000000,
  isActive: true,
} as Partial<User> as User;

const sign = (body: unknown) => {
  const selfSignature = crypto.createHmac('sha1', WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex');
  return `sha1=${selfSignature}`;
};

describe('ActivityController', () => {
  let controller: ActivityController;
  let userService: Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUserByUserId: vi.fn(),
            getByGithubId: vi.fn(),
            updateUser: vi.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            auth: { github: { activityWebhookSecret: WEBHOOK_SECRET } },
          },
        },
      ],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
    userService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getActivity', () => {
    it('returns the activity flags of the current user', async () => {
      userService.getUserByUserId.mockResolvedValue(mockUser);
      const req = { user: { id: 42 } } as CurrentRequest;

      const result = await controller.getActivity(req);

      expect(userService.getUserByUserId).toHaveBeenCalledWith(42);
      expect(result).toEqual({ isActive: true, lastActivityTime: 1700000000000 });
    });
  });

  describe('createActivity', () => {
    it('updates the user activity and returns the new state', async () => {
      vi.spyOn(Date, 'now').mockReturnValue(1234567890);
      userService.getUserByUserId.mockResolvedValue(mockUser);
      userService.updateUser.mockResolvedValue();
      const req = { user: { id: 42 } } as CurrentRequest;
      const body: CreateActivityDto = { isActive: false };

      const result = await controller.createActivity(body, req);

      expect(userService.getUserByUserId).toHaveBeenCalledWith(42);
      expect(userService.updateUser).toHaveBeenCalledWith(42, {
        lastActivityTime: 1234567890,
        isActive: false,
      });
      expect(result).toEqual({ isActive: false, lastActivityTime: 1234567890 });

      vi.restoreAllMocks();
    });
  });

  describe('createActivityWebhook', () => {
    const buildReq = (signature?: string) =>
      ({ headers: signature ? { 'x-hub-signature': signature } : {} }) as unknown as Request;

    it('throws Unauthorized when the signature header is missing', async () => {
      const body = { sender: { login: { githubId: 'john-doe' } } } as CreateActivityWebhookDto;

      await expect(controller.createActivityWebhook(body, buildReq())).rejects.toThrow(UnauthorizedException);
      await expect(controller.createActivityWebhook(body, buildReq())).rejects.toThrow('x-hub-signature is missing');
    });

    it('throws Unauthorized when the signature does not match', async () => {
      const body = { sender: { login: { githubId: 'john-doe' } } } as CreateActivityWebhookDto;
      const wrongSignature = sign({ sender: { login: { githubId: 'someone-else' } } });

      await expect(controller.createActivityWebhook(body, buildReq(wrongSignature))).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.createActivityWebhook(body, buildReq(wrongSignature))).rejects.toThrow(
        "Signatures didn't match",
      );
    });

    it('throws BadRequest when sender is missing', async () => {
      const body = {} as CreateActivityWebhookDto;

      await expect(controller.createActivityWebhook(body, buildReq(sign(body)))).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when sender.login is missing', async () => {
      const body = { sender: {} } as CreateActivityWebhookDto;

      await expect(controller.createActivityWebhook(body, buildReq(sign(body)))).rejects.toThrow(BadRequestException);
    });

    it('throws NotFound when the user does not exist', async () => {
      const body = { sender: { login: { githubId: 'ghost' } } } as CreateActivityWebhookDto;
      userService.getByGithubId.mockResolvedValue(null);

      await expect(controller.createActivityWebhook(body, buildReq(sign(body)))).rejects.toThrow(NotFoundException);
      await expect(controller.createActivityWebhook(body, buildReq(sign(body)))).rejects.toThrow(
        'User with GitHub id ghost not found',
      );
    });

    it('updates activity and returns the new state for a valid signed payload', async () => {
      vi.spyOn(Date, 'now').mockReturnValue(1234567890);
      const body = { sender: { login: { githubId: 'john-doe' } } } as CreateActivityWebhookDto;
      userService.getByGithubId.mockResolvedValue(mockUser);
      userService.updateUser.mockResolvedValue();

      const result = await controller.createActivityWebhook(body, buildReq(sign(body)));

      expect(userService.getByGithubId).toHaveBeenCalledWith('john-doe');
      expect(userService.updateUser).toHaveBeenCalledWith(42, {
        lastActivityTime: 1234567890,
        isActive: true,
      });
      expect(result).toEqual({ isActive: true, lastActivityTime: 1234567890 });

      vi.restoreAllMocks();
    });
  });
});
