import { User } from '@entities/user';
import { Injectable } from '@nestjs/common';
import { Profile } from 'passport';
import type { Request } from 'express';
import { CourseUsersService, CourseTasksService } from '../courses';
import { UsersService } from '../users/users.service';
import { AuthUser } from './auth-user.model';
import { JwtService } from './jwt.service';
import { ConfigService } from '../config';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginData, LoginState } from '@entities/loginState';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { customAlphabet } from 'nanoid/async';

const nanoid = customAlphabet('1234567890abcdef', 10);

export type CurrentRequest = Request & {
  user: AuthUser;
  loginState?: LoginData;
};

@Injectable()
export class AuthService {
  private readonly admins: string[] = [];

  constructor(
    private readonly jwtService: JwtService,
    readonly courseTaskService: CourseTasksService,
    readonly courseUserService: CourseUsersService,
    readonly userService: UsersService,
    readonly configService: ConfigService,
    @InjectRepository(LoginState)
    private readonly loginStateRepository: Repository<LoginState>,
  ) {
    this.admins = configService.users.admins;
  }

  public async createAuthUser(profile: Profile, admin = false): Promise<AuthUser> {
    const username = profile.username?.toLowerCase();
    const providerUserId = profile.id.toString();
    const provider = profile.provider.toString();
    const result =
      (provider ? await this.userService.getUserByProvider(provider, providerUserId) : undefined) ??
      (await this.userService.getFullUserByGithubId(username));

    if (result != null && (result.githubId !== username || !result.provider)) {
      await this.userService.saveUser({
        id: result.id,
        provider: provider,
        providerUserId: providerUserId,
        githubId: username,
      });
    }

    const isAdmin = this.admins.includes(username) || admin;

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
      const createdUser = await this.userService.saveUser(user);
      return new AuthUser(createdUser, [], isAdmin);
    }

    const courseTasks = await this.courseTaskService.getByOwner(username);
    return new AuthUser(result, courseTasks, isAdmin);
  }

  public validateGithub(req: CurrentRequest) {
    if (!req.user) {
      return null;
    }

    return this.jwtService.createToken(req.user);
  }

  public async createLoginState(data: LoginData) {
    const id = await nanoid();

    await this.loginStateRepository.save({
      id,
      data,
    });

    return id;
  }

  public getLoginState(id: string) {
    const date = new Date();
    date.setHours(date.getHours() - 1);
    return this.loginStateRepository.findOne({
      where: {
        id,
        createdDate: MoreThanOrEqual(date.toISOString()),
      },
    });
  }

  getRedirectUrl(loginData?: LoginData) {
    return loginData?.redirectUrl ? decodeURIComponent(loginData.redirectUrl) : '/';
  }
}
