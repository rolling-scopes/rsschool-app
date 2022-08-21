import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { CourseTasksService, CourseUsersService } from '../courses';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { ConfigService } from '../config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { UserNotificationsService } from '../users-notifications/users.notifications.service';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { LoginState } from '@entities/loginState';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: {} },
        { provide: CourseTasksService, useValue: {} },
        { provide: CourseUsersService, useValue: {} },
        { provide: UsersService, useValue: {} },
        {
          provide: ConfigService,
          useValue: { users: { admins: [] } },
        },
        { provide: getRepositoryToken(LoginState), useValue: {} },
        { provide: UserNotificationsService, useValue: {} },
        { provide: HttpService, useValue: {} },
        { provide: getRepositoryToken(NotificationUserConnection), useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
