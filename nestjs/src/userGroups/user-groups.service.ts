import { User } from '@entities/user';
import { UserGroup } from '@entities/UserGroup';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateUserGroupDto, UpdateUserGroupDto, UserGroupDto } from './dto';

@Injectable()
export class UserGroupsService {
  constructor(
    @InjectRepository(UserGroup)
    private repository: Repository<UserGroup>,
    private usersService: UsersService,
  ) {}

  public async getAll() {
    const userGroups = await this.repository.find();
    const usersIds = [...new Set(userGroups.reduce((acc, { users }) => [...acc, ...users], [] as number[]))];
    const users = await this.usersService.getUsersByUserIds(usersIds);

    return this.formatGroup(userGroups, users);
  }

  public async create(data: CreateUserGroupDto) {
    const userGroup = await this.repository.save(data);
    const users = await this.usersService.getUsersByUserIds(userGroup.users);
    return this.formatGroup([userGroup], users);
  }

  public async update(id: number, data: UpdateUserGroupDto) {
    const userGroup = await this.repository.save({ id, ...data });
    const users = await this.usersService.getUsersByUserIds(userGroup.users);
    return this.formatGroup([userGroup], users);
  }

  public async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  private formatUser(users: User[]) {
    return (userId: number) => {
      const user = users.find(ur => ur.id === userId) ?? {
        id: -1,
        githubId: 'UNKNOWN',
        firstName: '',
        lastName: '',
      };

      return {
        id: user.id,
        githubId: user.githubId,
        name: [user.firstName, user.lastName].filter(Boolean).join(' '),
      };
    };
  }

  private formatGroup(userGroups: UserGroup[], users: User[]) {
    const usersGroups: UserGroupDto[] = userGroups
      .map(g => ({
        id: g.id,
        name: g.name,
        roles: g.roles,
        users: g.users.map(this.formatUser(users)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return usersGroups;
  }
}
