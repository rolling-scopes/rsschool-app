import { AbstractRepository, EntityRepository, getRepository } from 'typeorm';
import { MentorBasic } from '../../../common/models';
import { Mentor, CourseTask } from '../models';
import { userService } from '../services';
import { flatMap, max } from 'lodash';

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
      .createQueryBuilder('courseTask')
      .select(['courseTask.id'])
      .leftJoin('courseTask.task', 'task')
      .where('task.verification = :manual', { manual: 'manual' })
      .andWhere('"courseTask".checker = :mentor', { mentor: 'mentor' })
      .andWhere('"courseTask"."courseId" = :courseId', { courseId })
      .andWhere('"courseTask"."studentEndDate" < NOW()');

    const courseTasks = await courseTaskQuery.getMany();

    const query = getRepository(Mentor)
      .createQueryBuilder('mentor')
      .innerJoin('mentor.user', 'user')
      .addSelect(this.getPrimaryUserFields())
      .leftJoin('mentor.students', 'students')
      .addSelect(['students.id', 'students.isExpelled', 'students.isFailed'])
      .leftJoin('students.taskResults', 'taskResults', `taskResults.courseTaskId IN (:...taskIds)`, {
        taskIds: courseTasks.length > 0 ? courseTasks.map(t => t.id) : [null],
      })
      .leftJoin('mentor.stageInterviews', 'si')
      .leftJoin('mentor.taskChecker', 'taskChecker')
      .leftJoin('taskChecker.courseTask', 'courseTask', 'courseTask.type = :type', { type: 'interview' })
      .addSelect([
        'si.id',
        'taskResults.id',
        'taskResults.score',
        'taskResults.courseTaskId',
        'taskResults.updatedDate',
        'taskChecker.id',
        'taskChecker.courseTaskId',
        'courseTask.id',
        'courseTask.type',
      ])
      .where(`"mentor"."courseId" = :courseId`, { courseId })
      .orderBy('mentor.createdDate');

    const records = await query.getMany();

    const count = courseTasks.length;
    const mentors = records.map(mentor => {
      const mentorBasic = transformMentor(mentor);
      const user = mentor.user;
      const activeStudents = mentor.students?.filter(s => !s.isExpelled && !s.isFailed) ?? [];
      const totalToCheck = activeStudents.length * count;
      const lastUpdatedDate = max(
        flatMap(mentor.students ?? [], s => s.taskResults?.map(r => new Date(r.updatedDate).getTime()) ?? []),
      );
      return {
        ...mentorBasic,
        cityName: user.cityName ?? '',
        countryName: user.countryName ?? '',
        maxStudentsLimit: mentor.maxStudentsLimit,
        studentsPreference: mentor.studentsPreference ?? 'any',
        studentsCount: activeStudents.length,
        interviews: {
          techScreeningsCount: mentor.stageInterviews ? mentor.stageInterviews.length : 0,
          interviewsCount: mentor.taskChecker?.filter(tc => tc.courseTask.type === 'interview').length,
        },
        taskResultsStats: {
          lastUpdatedDate,
          total: totalToCheck,
          checked: activeStudents.reduce((acc, student) => acc + (student.taskResults?.length ?? 0), 0) ?? 0,
        },
      };
    });
    return mentors;
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
