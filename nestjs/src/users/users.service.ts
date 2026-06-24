import { User } from '@entities/user';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  public async getByGithubId(id: string) {
    const githubId = id.toLowerCase();

    const [user] = await this.userRepository.find({ where: { githubId } });
    if (user == null) {
      return null;
    }
    return user;
  }

  public getUserByProvider(provider: string, providerUserId: string) {
    return this.userRepository.findOne({
      where: { provider, providerUserId },
      relations: ['mentors', 'students', 'mentors.course', 'students.course', 'courseUsers', 'courseUsers.course'],
    });
  }

  public saveUser(user: Partial<User>) {
    return this.userRepository.save(user);
  }

  // Admin bulk upsert by githubId (mirrors legacy POST /users).
  public async upsertUsers(items: Partial<User>[]): Promise<{ status: string; value: string }[]> {
    const result: { status: string; value: string }[] = [];

    for (const item of items) {
      try {
        const entity = await this.userRepository.findOne({ where: { githubId: item.githubId!.toLowerCase() } });

        if (entity == null) {
          const user = await this.userRepository.save(item);
          result.push({ status: 'created', value: `GithubId: ${item.githubId}, UserId: ${user.id}` });
        } else {
          const user = await this.userRepository.save({ ...entity, ...item });
          result.push({ status: 'updated', value: `GithubId: ${item.githubId}, UserId: ${user.id}` });
        }
      } catch (e) {
        result.push({ status: 'failed', value: `GithubId: ${item.githubId}. Error: ${(e as Error).message}` });
      }
    }

    return result;
  }

  // Admin toggle of the activist flag (mirrors legacy POST /users/:userId/activist). Returns false when the user is absent.
  // Uses a partial update (not save) to avoid rewriting unrelated columns / triggering entity update hooks.
  public async setActivist(userId: number, activist: boolean): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user == null) {
      return false;
    }
    await this.userRepository.update(userId, { activist });
    return true;
  }

  public async updateUser(id: number, user: Partial<Omit<User, 'id' | 'githubId'>>) {
    await this.userRepository.update(id, user);
  }

  public getUserByUserId(userId: number) {
    return this.userRepository.findOneOrFail({
      where: { id: userId },
    });
  }

  public getUsersByUserIds(userIds: number[]) {
    return this.userRepository.find({
      where: { id: In(userIds) },
    });
  }

  public static getFullName({ firstName, lastName }: { firstName: string; lastName: string }) {
    const result = [];
    if (firstName) {
      result.push(firstName.trim());
    }
    if (lastName) {
      result.push(lastName.trim());
    }
    return result.join(' ');
  }

  public async searchUsersBasic(searchText?: string) {
    if (!searchText) {
      return [];
    }

    return this.userRepository
      .createQueryBuilder('user')
      .where(
        "user.githubId like :text OR user.firstName ilike :text OR user.lastName ilike :text OR CONCAT(user.firstName, ' ', user.lastName) ilike :text",
        { text: searchText.toLowerCase() + '%' },
      )
      .orWhere(`CAST(user.discord AS jsonb)->>'username' ILIKE :search`, { search: `${searchText}%` })
      .limit(20)
      .getMany();
  }

  public async searchUsers(reqQuery?: string) {
    if (!reqQuery) {
      return [];
    }

    const search = `${reqQuery.trim()}%`;

    // Search by full name, githubId, discord username
    const searchTerms = search.split(' ');

    const query = this.userRepository.createQueryBuilder().select(['id']).limit(20);

    searchTerms.forEach((term, index) => {
      query.andWhere(
        new Brackets(qb => {
          qb.where(`"firstName" ILIKE :searchText${index}`, { [`searchText${index}`]: `%${term}%` })
            .orWhere(`"lastName" ILIKE :searchText${index}`, { [`searchText${index}`]: `%${term}%` })
            .orWhere(`"githubId" ILIKE :searchText${index}`, { [`searchText${index}`]: `%${term}%` })
            .orWhere(`CAST("discord" AS jsonb)->>'username' ILIKE :searchText${index}`, {
              [`searchText${index}`]: `%${term}%`,
            });
        }),
      );
    });

    const userIds = await query.getRawMany();

    if (userIds.length === 0) {
      return [];
    }

    // Get full user data by ids
    return this.userRepository.find({
      where: { id: In(userIds.map(({ id }) => id)) },
      relations: ['mentors', 'students', 'mentors.course', 'students.course', 'students.certificate'],
    });
  }

  public static getPrimaryUserFields(modelName = 'user') {
    return [
      `${modelName}.id`,
      `${modelName}.firstName`,
      `${modelName}.lastName`,
      `${modelName}.githubId`,
      `${modelName}.cityName`,
      `${modelName}.countryName`,
      `${modelName}.discord`,
    ];
  }

  public static getUserContactsFields(modelName = 'user') {
    return [
      `${modelName}.contactsEmail`,
      `${modelName}.contactsTelegram`,
      `${modelName}.contactsLinkedIn`,
      `${modelName}.contactsSkype`,
      `${modelName}.contactsPhone`,
    ];
  }
}
