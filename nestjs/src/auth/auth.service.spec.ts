import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { CourseTasksService, CourseUsersService } from '../courses';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { ConfigService } from '../config';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: CourseTasksService, useValue: {} },
        { provide: CourseUsersService, useValue: {} },
        { provide: UsersService, useValue: {} },
        {
          provide: ConfigService,
          useValue: { users: { admins: [] } },
        },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
