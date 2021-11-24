import { User } from '@entities/user';
import { Injectable } from '@nestjs/common';
import { Profile } from 'passport';
import { CourseTaskService, CourseUserService } from '../course';
import { UserService } from '../user/user.service';
import { CurrentUser } from './current-user.model';
import { JwtService } from './jwt.service';

export type CurrentRequest = Request & {
  user: CurrentUser;
};

@Injectable()
export class AuthService {
  private readonly admins: string[] = [];
  private readonly hirers: string[] = [];

  constructor(
    private readonly jwtService: JwtService,
    readonly courseTaskService: CourseTaskService,
    readonly courseUserService: CourseUserService,
    readonly userService: UserService,
  ) {}

  public async createRequestUser(profile: Profile, admin = false): Promise<CurrentUser> {
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
    const isHirer = this.hirers.includes(username);

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
      return new CurrentUser(createdUser, [], isAdmin);
    }

    const courseTasks = await this.courseTaskService.getByOwner(username);
    return new CurrentUser(result, courseTasks, isAdmin);
  }

  public validateGithub(req: CurrentRequest) {
    if (!req.user) {
      return null;
    }

    return this.jwtService.createToken(req.user);
  }
}
