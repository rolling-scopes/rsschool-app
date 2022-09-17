import { LoginData, LoginState } from '@entities/loginState';
import { User } from '@entities/user';
import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import { customAlphabet } from 'nanoid/async';
import type { Profile } from 'passport';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { ConfigService } from '../config';
import { CourseTasksService } from '../courses';
import { UsersService } from '../users/users.service';
import { AuthUser } from './auth-user.model';
import { JwtService } from '../core/jwt/jwt.service';
import { lastValueFrom } from 'rxjs';
import * as dayjs from 'dayjs';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { CourseUser } from '@entities/courseUser';

const nanoid = customAlphabet('1234567890abcdef', 10);

export type CurrentRequest = Request & {
  user: AuthUser;
  loginState?: LoginData;
};

export type LoginStateParams = {
  userId?: number;
  expires?: string;
  data: LoginData;
};

export type AuthDetails = {
  id: number;
  githubId: string;
  students: { courseId: number; id: number }[];
  mentors: { courseId: number; id: number }[];
  courseUsers: CourseUser[];
};

@Injectable()
export class AuthService {
  private readonly admins: string[] = [];
  private readonly hirers: string[] = [];

  constructor(
    private readonly jwtService: JwtService,
    readonly courseTaskService: CourseTasksService,
    readonly userService: UsersService,
    readonly configService: ConfigService,
    @InjectRepository(LoginState)
    private readonly loginStateRepository: Repository<LoginState>,
    @InjectRepository(NotificationUserConnection)
    private notificationUserConnectionRepository: Repository<NotificationUserConnection>,
    private httpService: HttpService,
  ) {
    this.admins = configService.users.admins;
    this.hirers = configService.users.hirers;
  }

  public async createAuthUser(profile: Profile, admin = false): Promise<AuthUser> {
    const username = profile.username?.toLowerCase();
    const providerUserId = profile.id.toString();
    const provider = profile.provider.toString();
    const result =
      (provider ? await this.userService.getUserByProvider(provider, providerUserId) : undefined) ??
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (await this.userService.getByGithubId(username!));

    if (result != null && (result.githubId !== username || !result.provider)) {
      await this.userService.saveUser({
        id: result.id,
        provider: provider,
        providerUserId: providerUserId,
        githubId: username,
      });
    }

    if (result == null) {
      const [email] = profile.emails?.filter((email: any) => !!email.primary) ?? [];

      const user: Partial<User> = {
        githubId: username,
        providerUserId,
        provider,
        primaryEmail: email ? email.value : undefined,
        firstName: profile.name ? profile.name.givenName : '',
        lastName: profile.name ? profile.name.familyName : '',
        lastActivityTime: Date.now(),
      };
      await this.userService.saveUser(user);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const authUser = await this.getAuthUser(username!, admin);
    return authUser;
  }

  public async getAuthUser(username: string, admin = false) {
    const [authInfo, courseTasks] = await Promise.all([
      this.getAuthDetails(username),
      this.courseTaskService.getByOwner(username),
    ]);
    const isAdmin = this.admins.includes(username) || admin;
    const isHirer = this.hirers.includes(username);
    return new AuthUser(authInfo, courseTasks, isAdmin, isHirer);
  }

  public validateGithub(req: CurrentRequest) {
    if (!req.user) {
      return null;
    }

    return this.jwtService.createToken(req.user);
  }

  public async createLoginState(params: LoginStateParams) {
    const id = await nanoid();
    const { data, expires, userId } = params;

    await this.loginStateRepository.save({
      id,
      data,
      userId,
      expires,
    });

    return id;
  }

  public getLoginStateById(id: string) {
    return this.loginStateRepository.findOne({
      where: {
        id,
        expires: MoreThanOrEqual(dayjs().toISOString()),
      },
      order: {
        createdDate: 'DESC',
      },
    });
  }

  public getLoginStateByUserId(id: number) {
    return this.loginStateRepository.findOne({
      where: {
        userId: id,
        expires: MoreThanOrEqual(dayjs().toISOString()),
      },
      order: {
        createdDate: 'DESC',
      },
    });
  }

  public deleteLoginState(id: string) {
    return this.loginStateRepository.delete(id);
  }

  public getRedirectUrl(loginData?: LoginData) {
    return loginData?.redirectUrl ? decodeURIComponent(loginData.redirectUrl) : '/';
  }

  public async onConnectionComplete(loginData: LoginData, userId: number) {
    const { channelId, externalId } = loginData;
    if (!channelId || !externalId) {
      return;
    }

    this.notificationUserConnectionRepository.save({
      channelId,
      enabled: true,
      externalId,
      userId,
    });

    const { restApiKey, restApiUrl } = this.configService.awsServices;

    if (channelId === 'telegram') {
      await lastValueFrom(
        this.httpService.post(
          `${restApiUrl}/connection/complete`,
          {
            channelId,
            externalId,
          },
          {
            headers: { 'x-api-key': restApiKey },
          },
        ),
      );
    }
  }

  public async getAuthDetails(githubId: string): Promise<AuthDetails> {
    const query = this.loginStateRepository.manager
      .createQueryBuilder(User, 'user')
      .select('user.id', 'id')
      .addSelect('user.githubId', 'githubId')
      .addSelect(
        qb =>
          qb
            .select(`jsonb_agg(json_build_object('id', mentor.id, 'courseId', mentor."courseId"))`)
            .from('mentor', 'mentor')
            .where('mentor.userId = user.id'),
        'mentors',
      )
      .addSelect(
        qb =>
          qb
            .select(`jsonb_agg(json_build_object('id', student.id, 'courseId', student."courseId"))`)
            .from('student', 'student')
            .where('student.userId = user.id'),
        'students',
      )
      .addSelect(
        qb => qb.select('jsonb_agg("courseUser")').from(CourseUser, 'courseUser').where('courseUser.userId = user.id'),
        'courseUsers',
      )
      .where({
        githubId,
      });

    const result = await query.getRawOne();
    if (result == null) {
      throw new NotFoundException('User not found');
    }
    return {
      id: result.id,
      githubId: result.githubId,
      students: result.students ?? [],
      mentors: result.mentors ?? [],
      courseUsers: result.courseUsers ?? [],
    };
  }
}
