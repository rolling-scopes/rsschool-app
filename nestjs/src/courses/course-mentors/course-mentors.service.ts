import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CourseTask, Mentor, TaskResult } from '@entities/index';
import { MentorDetails } from '@common/models';
import { UsersService } from '../../users/users.service';
import { MentorsService } from '../mentors';
import { PersonDto } from '../../core/dto';
import { PreferredStudentsLocation } from '@common/enums/mentor';

@Injectable()
export class CourseMentorsService {
  constructor(
    @InjectRepository(Mentor)
    readonly mentorsRepository: Repository<Mentor>,
    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
    private dataSource: DataSource,
  ) {}

  private async getMentorCheckerCourseTaskIds(courseId: number): Promise<[number[], number]> {
    const [courseTasks, count] = await this.courseTaskRepository
      .createQueryBuilder('c')
      .select('c.id')
      .leftJoin('c.task', 't')
      .where({ checker: 'mentor', courseId, disabled: false })
      .andWhere('c.studentEndDate < NOW()')
      .andWhere("c.type <> 'interview'")
      .getManyAndCount();

    return [courseTasks.map(task => task.id), count];
  }

  public async getMentorsWithStats(courseId: number): Promise<MentorDetails[]> {
    const [courseTasksIds, count] = await this.getMentorCheckerCourseTaskIds(courseId);

    const query = this.mentorsRepository
      .createQueryBuilder('mentor')
      .innerJoin('mentor.user', 'user')
      .addSelect(UsersService.getPrimaryUserFields())
      .addSelect(['user.contactsEpamEmail'])
      .leftJoin('mentor.students', 's')
      .leftJoin('mentor.stageInterviews', 'si')
      .leftJoin('mentor.taskChecker', 'tc')
      .leftJoin('mentor.interviewResults', 'ir')
      .leftJoin('tc.courseTask', 't', 't.type = :type', { type: 'interview' })
      .addSelect(['s.id', 's.isExpelled', 's.isFailed'])
      .addSelect(['si.id', 'si.isCompleted'])
      .addSelect(['tc.id', 'tc.courseTaskId'])
      .addSelect(['t.id', 't.type'])
      .addSelect(['ir.id'])
      .where(`"mentor"."courseId" = :courseId`, { courseId })
      .orderBy('mentor.createdDate');

    const [records, checkedCountByMentor, lastCheckedDateByMentor] = await Promise.all([
      query.getMany(),
      this.getCheckedTasksCount(courseId, courseTasksIds),
      this.getLastCheckedDates(courseId, courseTasksIds),
    ]);

    const mentors = [];
    for (const mentor of records) {
      const mentorBasic = MentorsService.convertMentorToMentorBasic(mentor);

      const user = mentor.user;
      const activeStudents = mentor.students?.filter(s => !s.isExpelled && !s.isFailed) ?? [];
      const totalToCheck = activeStudents.length * count;

      const lastCheckedDate = lastCheckedDateByMentor[mentor.id];
      const checkedCount = checkedCountByMentor[mentor.id] ?? 0;

      mentors.push({
        ...mentorBasic,
        cityName: user.cityName ?? '',
        countryName: user.countryName ?? '',
        contactsEpamEmail: user.contactsEpamEmail ?? '',
        maxStudentsLimit: mentor.maxStudentsLimit,
        studentsPreference: mentor.studentsPreference ?? PreferredStudentsLocation.ANY,
        studentsCount: activeStudents.length,
        screenings: {
          total: mentor.stageInterviews?.length ?? 0,
          completed: mentor.stageInterviews?.filter(s => s.isCompleted).length ?? 0,
        },
        interviews: {
          total: mentor.taskChecker?.filter(tc => tc.courseTask?.type === 'interview').length,
          completed: mentor.interviewResults?.length ?? 0,
        },
        taskResultsStats: {
          lastUpdatedDate: lastCheckedDate ? new Date(lastCheckedDate) : null,
          total: totalToCheck,
          checked: checkedCount,
        },
      });
    }
    return mentors;
  }

  public async searchMentors(
    courseId: number,
    searchText: string,
  ): Promise<{ id: number; githubId: string; name: string }[]> {
    const entities = await this.mentorsRepository
      .createQueryBuilder('mentor')
      .innerJoin('mentor.user', 'user')
      .addSelect(['user.id', 'user.firstName', 'user.lastName', 'user.githubId'])
      .where('"mentor"."courseId" = :courseId', { courseId })
      .andWhere('"mentor"."isExpelled" = false')
      .andWhere(
        `
        (
          "user"."githubId" ILIKE :searchText OR
          "user"."firstName" ILIKE :searchText OR
          "user"."lastName" ILIKE :searchText OR
          CONCAT("user"."firstName", ' ', "user"."lastName") ILIKE :searchText
        )
      `,
        { courseId, searchText },
      )
      .limit(20)
      .getMany();

    const result = entities.map(entity => ({
      id: entity.id,
      githubId: entity.user.githubId,
      name: PersonDto.getName(entity.user),
    }));

    return result;
  }

  private async getLastCheckedDates(courseId: number, courseTasksIds: number[]): Promise<Record<string, Date | null>> {
    const query = this.dataSource
      .createQueryBuilder()
      .select('m.id', 'id')
      .addSelect('tr."updatedDate"', 'value')
      .from(Mentor, 'm')
      .leftJoin('user', 'u', 'u."id" = m."userId"')
      .leftJoin(
        qb =>
          qb
            .select('t.lastCheckerId', 'lastCheckerId')
            .addSelect('MAX(t."updatedDate")', 'updatedDate')
            .from(TaskResult, 't')
            // add 0 to prevent empty array
            .where('t.courseTaskId IN (:...ids)', { ids: courseTasksIds.concat([0]) })
            .groupBy('t.lastCheckerId'),
        'tr',
        'tr."lastCheckerId" = u.id',
      )
      .where('m."courseId" = :courseId', { courseId });

    const result: { id: number; value: Date | null }[] = await query.getRawMany();

    return Object.fromEntries(result.map(({ id, value }) => [id, value]));
  }

  private async getCheckedTasksCount(courseId: number, courseTasksIds: number[]): Promise<Record<string, number>> {
    const query = this.dataSource
      .createQueryBuilder()
      .select('m.id', 'id')
      .addSelect('COUNT(tr."lastCheckerId")', 'value')
      .from(Mentor, 'm')
      .leftJoin('user', 'u', 'u."id" = m."userId"')
      .leftJoin(
        qb =>
          qb
            .select('t.lastCheckerId', 'lastCheckerId')
            .addSelect('t.updatedDate', 'updatedDate')
            .from(TaskResult, 't')
            // add 0 to prevent empty array
            .where('t.courseTaskId IN (:...ids)', { ids: courseTasksIds.concat([0]) }),
        'tr',
        'tr."lastCheckerId" = u.id',
      )
      .where('m."courseId" = :courseId', { courseId })
      .groupBy('m.id');

    const result: { id: number; value: string }[] = await query.getRawMany();

    return Object.fromEntries(result.map(({ id, value }) => [id, Number(value)]));
  }
}
