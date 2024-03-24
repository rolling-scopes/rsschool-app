import { toUpper, camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegistryService } from 'src/registry/registry.service';
import { UsersService } from 'src/users/users.service';
import { MentorStats } from '@common/models';
import { Course, Mentor, Student, User } from '@entities/index';

@Injectable()
export class MentorInfoService {
  constructor(
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,

    private userService: UsersService,
    private registryService: RegistryService,
  ) {}

  async getRegistryCourses(githubId: string): Promise<{ courseId: number }[] | null> {
    const [registeredCourseIds, registryCourseIds] = await Promise.all([
      this.getRegisteredMentorsCourseIds(githubId),
      this.registryService.getMentorsFromRegistryCourseIds(githubId),
    ]);

    const mentorsCourses = registeredCourseIds.concat(registryCourseIds);

    return mentorsCourses.length ? mentorsCourses : null;
  }

  private async getRegisteredMentorsCourseIds(githubId: string) {
    const result: { courseId: number }[] = await this.mentorRepository
      .createQueryBuilder('mentor')
      .select(['mentor.courseId'])
      .leftJoin('mentor.user', 'user')
      .where('user.githubId = :githubId', { githubId })
      .getMany();

    return result.length ? result : [];
  }

  async getStats(githubId: string): Promise<MentorStats[]> {
    const rawData = await this.mentorRepository
      .createQueryBuilder('mentor')
      .select('"course"."name" AS "courseName"')
      .addSelect('"course"."alias" AS "courseAlias"')
      .addSelect('"course"."id" AS "courseId"')
      .addSelect('"course"."locationName" AS "courseLocationName"')
      .addSelect('ARRAY_AGG ("userStudent"."githubId") AS "studentGithubIds"')
      .addSelect('ARRAY_AGG ("userStudent"."firstName") AS "studentFirstNames"')
      .addSelect('ARRAY_AGG ("userStudent"."lastName") AS "studentLastNames"')
      .addSelect('ARRAY_AGG ("student"."isExpelled") AS "studentIsExpelledStatuses"')
      .addSelect('ARRAY_AGG ("student"."totalScore") AS "studentTotalScores"')
      .leftJoin(User, 'user', '"user"."id" = "mentor"."userId"')
      .leftJoin(Course, 'course', '"course"."id" = "mentor"."courseId"')
      .leftJoin(Student, 'student', '"student"."mentorId" = "mentor"."id"')
      .leftJoin(User, 'userStudent', '"userStudent"."id" = "student"."userId"')
      .where('"user"."githubId" = :githubId', { githubId })
      .groupBy('"course"."id"')
      .orderBy('"course"."endDate"', 'DESC')
      .getRawMany();
    return rawData.map(
      ({
        courseName,
        courseAlias,
        courseLocationName,
        studentGithubIds,
        studentFirstNames,
        studentLastNames,
        studentIsExpelledStatuses,
        studentTotalScores,
      }: any) => {
        const students = studentGithubIds[0]
          ? studentGithubIds.map((githubId: string, idx: number) => ({
              githubId,
              name:
                this.userService.getFullName({ firstName: studentFirstNames[idx], lastName: studentLastNames[idx] }) ||
                githubId,
              isExpelled: studentIsExpelledStatuses[idx],
              totalScore: studentTotalScores[idx],
              repoUrl: `https://github.com/rolling-scopes-school/${githubId}-${toUpper(camelCase(courseAlias))}`,
            }))
          : undefined;
        return { courseLocationName, courseName, students };
      },
    );
  }
}
