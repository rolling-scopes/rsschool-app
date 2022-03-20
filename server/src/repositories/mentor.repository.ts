import { AbstractRepository, EntityRepository, getRepository } from 'typeorm';
import { MentorBasic } from '../../../common/models';
import { Mentor, CourseTask, TaskResult } from '../models';
import { userService } from '../services';
import { createQueryBuilder } from 'typeorm';

@EntityRepository(Mentor)
export class MentorRepository extends AbstractRepository<Mentor> {
  public async findActive(courseId: number, selectStudents = false) {
    let query = this.getPreparedMentorQuery(selectStudents)
      .where('mentor.courseId = :courseId', { courseId })
      .andWhere('mentor.isExpelled = false');
    if (selectStudents) {
      query = query.andWhere('students.isExpelled = false');
    }
    const result = await query.getMany();
    return result.map(transformMentor);
  }

  public async findByGithubId(courseId: number, githubId: string) {
    const query = this.getPreparedMentorQuery()
      .where('mentor.courseId = :courseId', { courseId })
      .andWhere('mUser.githubId = :githubId', { githubId });
    const result = await query.getOne();
    return result ? transformMentor(result) : null;
  }

  public async findActiveWithStudentsLimit(courseId: number) {
    const query = this.getPreparedMentorQuery(true)
      .addSelect('mentor.maxStudentsLimit')
      .where('mentor.courseId = :courseId', { courseId })
      .andWhere('mentor.isExpelled = false')
      .andWhere('(students.isExpelled = false OR students IS NULL)');
    const result = await query.getMany();
    return result.map(transformMentorWithStudentsLimit);
  }

  public async findExtended(courseId: number) {
    const courseTaskQuery = getRepository(CourseTask)
      .createQueryBuilder('c')
      .select('c.id')
      .leftJoin('c.task', 't')
      .where({ checker: 'mentor', courseId, disabled: false })
      .andWhere('c.studentEndDate < NOW()')
      .andWhere("c.type <> 'interview'");

    const courseTasks = await courseTaskQuery.getMany();
    const courseTasksIds = courseTasks.map(t => t.id);

    const query = getRepository(Mentor)
      .createQueryBuilder('mentor')
      .innerJoin('mentor.user', 'user')
      .addSelect(this.getPrimaryUserFields())
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

    const count = courseTasks.length;
    const mentors = [];
    for (const mentor of records) {
      const mentorBasic = transformMentor(mentor);

      const user = mentor.user;
      const activeStudents = mentor.students?.filter(s => !s.isExpelled && !s.isFailed) ?? [];
      const totalToCheck = activeStudents.length * count;

      const lastCheckedDate = lastCheckedDateByMentor.find(m => m.id === mentor.id)?.value ?? null;
      const checkedCount = checkedCountByMentor.find(m => m.id === mentor.id)?.value ?? 0;

      mentors.push({
        ...mentorBasic,
        cityName: user.cityName ?? '',
        countryName: user.countryName ?? '',
        maxStudentsLimit: mentor.maxStudentsLimit,
        studentsPreference: mentor.studentsPreference ?? 'any',
        studentsCount: activeStudents.length,
        screenings: {
          total: mentor.stageInterviews?.length ?? 0,
          completed: mentor.stageInterviews?.filter(s => s.isCompleted).length ?? 0,
        },
        interviews: {
          total: mentor.taskChecker?.filter(tc => tc.courseTask.type === 'interview').length,
          completed: mentor.interviewResults?.length ?? 0,
        },
        taskResultsStats: {
          lastUpdatedDate: lastCheckedDate,
          total: totalToCheck,
          checked: checkedCount,
        },
      });
    }
    return mentors;
  }

  private async getLastCheckedDates(courseId: number, courseTasksIds: number[]) {
    const query = createQueryBuilder()
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

    const result = await query.getRawMany();

    return result.map<{ id: number; value: string }>(({ id, value }) => ({
      id,
      value,
    }));
  }

  private async getCheckedTasksCount(courseId: number, courseTasksIds: number[]) {
    const query = createQueryBuilder()
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

    const result = await query.getRawMany();

    return result.map<{ id: number; value: number }>(({ id, value }) => ({
      id,
      value: Number(value),
    }));
  }

  private getPrimaryUserFields(modelName = 'user') {
    return [
      `${modelName}.id`,
      `${modelName}.firstName`,
      `${modelName}.lastName`,
      `${modelName}.githubId`,
      `${modelName}.cityName`,
      `${modelName}.countryName`,
    ];
  }

  private getPreparedMentorQuery(selectStudents = false) {
    let query = getRepository(Mentor)
      .createQueryBuilder('mentor')
      .select(['mentor.id', 'mentor.isExpelled', 'mentor.userId'])
      .innerJoin('mentor.user', 'mUser')
      .leftJoin('mentor.students', 'students')
      .addSelect([...this.getPrimaryUserFields('mUser')]);
    if (selectStudents) {
      query = query.addSelect(['students.id', 'students.courseId']);
    }
    return query;
  }
}

function transformMentor(record: Mentor): MentorBasic {
  return {
    id: record.id,
    name: userService.createName(record.user),
    githubId: record.user.githubId,
    cityName: record.user.cityName ?? 'Unknown',
    countryName: record.user.countryName ?? 'Unknown',
    isActive: !record.isExpelled,
    students: record.students?.map(s => ({ id: s.id })) ?? [],
  };
}

function transformMentorWithStudentsLimit(record: Mentor): MentorBasic & { maxStudentsLimit: number } {
  return {
    ...transformMentor(record),
    maxStudentsLimit: record.maxStudentsLimit ?? 0,
  };
}
