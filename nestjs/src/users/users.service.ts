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

  public updateUser(id: number, user: Partial<Omit<User, 'id' | 'githubId'>>) {
    return this.userRepository.update(id, user);
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
