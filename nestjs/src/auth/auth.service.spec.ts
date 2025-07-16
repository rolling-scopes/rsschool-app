import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { CourseTasksService } from '../courses';
import { AuthService } from './auth.service';
import { JwtService } from '../core/jwt/jwt.service';
import { ConfigService } from '../config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { UserNotificationsService } from '../users-notifications/users.notifications.service';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { LoginState } from '@entities/loginState';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: {} },
        { provide: CourseTasksService, useValue: {} },
        { provide: UsersService, useValue: {} },
        {
          provide: ConfigService,
          useValue: { users: { admins: [] } },
        },
        { provide: getRepositoryToken(LoginState), useValue: {} },
        { provide: UserNotificationsService, useValue: {} },
        { provide: HttpService, useValue: {} },
        { provide: getRepositoryToken(NotificationUserConnection), useValue: {} },
        { provide: CACHE_MANAGER, useValue: { del: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
