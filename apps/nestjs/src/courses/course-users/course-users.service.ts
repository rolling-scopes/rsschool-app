import { Injectable } from '@nestjs/common';
import { CourseUser } from '@entities/courseUser';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ExtendedCourseUser, PartialCourseUserData, SplitCourseUsers } from './types';
import { UpdateCourseUserDto } from './dto/update-user.dto';

@Injectable()
export class CourseUsersService {
  constructor(
    @InjectRepository(CourseUser)
    readonly courseUserRepository: Repository<CourseUser>,
  ) {}

  public getByUserId(userId: number, courseId: number): Promise<CourseUser | null> {
    return this.courseUserRepository.findOne({
      where: { userId, courseId },
    });
  }

  public getByGithubId(githubId: string, courseId: number): Promise<CourseUser | null> {
    return this.courseUserRepository.findOne({
      where: { courseId, user: { githubId } },
    });
  }

  public async getCourseUsersByCourseId(courseId: number): Promise<ExtendedCourseUser[]> {
    const rawCourseUsers = await this.courseUserRepository.find({
      where: { courseId },
      relations: ['user', 'course'],
    });

    const courseUsers = rawCourseUsers.map(({ user, course, ...rest }) => ({
      ...rest,
      name: this.createFullName(user.firstName, user.lastName),
      githubId: user.githubId,
    }));

    return courseUsers;
  }

  public async getUsersToUpdateAndToInsert(
    courseUserWithRoles: UpdateCourseUserDto[],
    courseId: number,
  ): Promise<SplitCourseUsers> {
    const courseUsersWithCourseId = courseUserWithRoles.map(user => ({ ...user, courseId }));
    const usersIds = courseUserWithRoles.map(({ userId }) => userId);

    const courseUsers = await this.courseUserRepository.find({
      where: {
        courseId,
        userId: In(usersIds),
      },
    });

    return courseUsersWithCourseId.reduce<SplitCourseUsers>(
      (acc, update) => {
        const foundUser = courseUsers.find(({ userId }) => update.userId === userId);
        if (foundUser) {
          acc.usersToUpdate.push({ ...foundUser, ...update });
        } else {
          acc.usersToInsert.push(update);
        }
        return acc;
      },
      { usersToInsert: [], usersToUpdate: [] },
    );
  }

  public saveCourseUsers(data: PartialCourseUserData) {
    return this.courseUserRepository.insert(data);
  }

  public updateCourseUser(courseUserId: number, data: QueryDeepPartialEntity<CourseUser>) {
    return this.courseUserRepository.update(courseUserId, data);
  }

  public async updateCourseUsersRoles(courseUsers: CourseUser[]) {
    await Promise.all(
      courseUsers.map(({ userId, isManager, isSupervisor, isDementor }) =>
        this.courseUserRepository.update({ userId }, { isManager, isSupervisor, isDementor }),
      ),
    );
  }

  private createFullName(firstName: string | null, lastName: string | null) {
    const names = [firstName?.trim(), lastName?.trim()].filter(Boolean);
    return names.length ? names.join(' ') : '';
  }
}
