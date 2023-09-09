import { EmploymentRecord, User } from '@entities/user';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

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

  public async getLastEmploymentRecord(userId: number): Promise<EmploymentRecord | undefined> {
    const { employmentHistory } = await this.userRepository.findOneOrFail({
      where: { id: userId },
      select: ['employmentHistory'],
    });

    return employmentHistory.at(-1);
  }

  public async saveNewEmploymentRecord(userId: number, employmentRecord: EmploymentRecord) {
    const { employmentHistory } = await this.userRepository.findOneOrFail({
      where: { id: userId },
      select: ['employmentHistory'],
    });

    const previousRecord = employmentHistory.at(-1);
    if (previousRecord) {
      previousRecord.dateTo = employmentRecord.dateFrom;
      previousRecord.toPresent = false;
    }

    const updatedHistory = [...employmentHistory.slice(0, -1), previousRecord, employmentRecord].filter(Boolean);

    return await this.userRepository.update(userId, { employmentHistory: updatedHistory });
  }

  public getFullName({ firstName, lastName }: { firstName: string; lastName: string }) {
    const result = [];
    if (firstName) {
      result.push(firstName.trim());
    }
    if (lastName) {
      result.push(lastName.trim());
    }
    return result.join(' ');
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
}
