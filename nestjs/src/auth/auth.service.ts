import { LoginData } from '@entities/loginState';
import { User } from '@entities/user';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import { customAlphabet } from 'nanoid/async';
import type { Profile } from 'passport';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { ConfigService } from '../config';
import { CourseTasksService } from '../courses';
import { UsersService } from '../users/users.service';
import { AuthUser } from './auth-user.model';
import { AuthRepository } from './auth.repository';
import { JwtService } from './jwt.service';
import { lastValueFrom } from 'rxjs';
import * as dayjs from 'dayjs';
import { NotificationUserConnection } from '@entities/notificationUserConnection';

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

@Injectable()
export class AuthService {
  private readonly admins: string[] = [];

  constructor(
    private readonly jwtService: JwtService,
    readonly courseTaskService: CourseTasksService,
    readonly userService: UsersService,
    readonly configService: ConfigService,
    @InjectRepository(AuthRepository)
    private readonly authRepository: AuthRepository,
    @InjectRepository(NotificationUserConnection)
    private notificationUserConnectionRepository: Repository<NotificationUserConnection>,
    private httpService: HttpService,
  ) {
    this.admins = configService.users.admins;
  }

  public async createAuthUser(profile: Profile, admin = false): Promise<AuthUser> {
    const username = profile.username?.toLowerCase();
    const providerUserId = profile.id.toString();
    const provider = profile.provider.toString();
    const result =
      (provider ? await this.userService.getUserByProvider(provider, providerUserId) : undefined) ??
      (await this.userService.getByGithubId(username));

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

    const authUser = await this.getAuthUser(username, admin);
    return authUser;
  }

  public async getAuthUser(username: string, admin = false) {
    const [authInfo, courseTasks] = await Promise.all([
      this.authRepository.getAuthDetails(username),
      this.courseTaskService.getByOwner(username),
    ]);
    const isAdmin = this.admins.includes(username) || admin;
    return new AuthUser(authInfo, courseTasks, isAdmin);
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

    await this.authRepository.save({
      id,
      data,
      userId,
      expires,
    });

    return id;
  }

  public getLoginStateById(id: string) {
    return this.authRepository.findOne({
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
    return this.authRepository.findOne({
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
    return this.authRepository.delete(id);
  }

  public getRedirectUrl(loginData?: LoginData) {
    return loginData?.redirectUrl ? decodeURIComponent(loginData.redirectUrl) : '/';
  }

  public async onConnectionComplete(loginData: LoginData, userId: number) {
    const { channelId, externalId } = loginData;

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
}
