import { User } from '@entities/user';
import { IUserSession, isAdmin, isManager, isSupervisor, isDementor } from '@entities/session';
import { StageInterview, StageInterviewFeedback, Mentor, Student } from '@entities/index';

import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { TaskResult } from '@entities/taskResult';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Mentor as MentorWithContacts } from './dto/mentor-student-summary.dto';
import { MentorBasic, StageInterviewFeedbackJson } from '@common/models';
import { ExpelStatusDto } from './dto/student-status.dto';

@Injectable()
export class CourseStudentsService {
  constructor(
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,

    @InjectRepository(Mentor)
    readonly mentorRepository: Repository<Mentor>,
    private readonly dataSource: DataSource,
  ) {}

  public async getStudentsWithDetails(courseId: number, activeOnly: boolean) {
    const records = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .addSelect(CourseStudentsService.getPrimaryUserFields())
      .innerJoin('student.course', 'course')
      .leftJoinAndSelect('student.mentor', 'mentor', 'mentor."isExpelled" = FALSE')
      .leftJoin('mentor.user', 'mentorUser')
      .leftJoin('student.stageInterviews', 'stageInterviews')
      .leftJoin('student.taskChecker', 'taskChecker')
      .leftJoin('taskChecker.courseTask', 'courseTask')
      .leftJoin('courseTask.task', 'task')
      .addSelect(CourseStudentsService.getPrimaryUserFields('mentorUser'))
      .addSelect(['stageInterviews.id', 'stageInterviews.isCompleted'])
      .addSelect(['taskChecker.id', 'courseTask.id', 'task.id', 'task.name'])
      .where(`course.id = :courseId ${activeOnly ? 'AND student."isExpelled" = false' : ''}`, { courseId })
      .orderBy('student.totalScore', 'DESC')
      .getMany();

    return records.map(record => CourseStudentsService.convertToStudentDetails(record));
  }

  public async getStudentsForCsv(courseId: number, activeOnly: boolean) {
    const records = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .addSelect(CourseStudentsService.getPrimaryUserFields())
      .innerJoin('student.course', 'course')
      .leftJoinAndSelect('student.mentor', 'mentor')
      .leftJoin('mentor.user', 'mentorUser')
      .addSelect(CourseStudentsService.getPrimaryUserFields('mentorUser'))
      .where(`course.id = :courseId ${activeOnly ? 'AND student."isExpelled" = false' : ''}`, { courseId })
      .orderBy('student.totalScore', 'DESC')
      .getMany();

    return records.map(student => {
      const mentor = student.mentor?.user
        ? {
            name: CourseStudentsService.buildName(student.mentor.user),
            githubId: student.mentor.user.githubId,
          }
        : null;
      return {
        id: student.id,
        githubId: student.user.githubId,
        name: CourseStudentsService.buildName(student.user),
        isActive: !student.isExpelled && !student.isFailed,
        mentorName: mentor?.name,
        mentorGithubId: mentor?.githubId,
        totalScore: student.totalScore,
        city: student.user.cityName ?? 'Unknown',
        country: student.user.countryName ?? 'Unknown',
      };
    });
  }

  public async searchCourseStudents(courseId: number, searchText: string, onlyStudentsWithoutMentorShown: boolean) {
    const searchQuery = `${searchText}%`;

    const query = this.studentRepository
      .createQueryBuilder('student')
      .select([`student.id`, 'mentor.id'])
      .addSelect(CourseStudentsService.getBasicUserFields('user'))
      .addSelect(CourseStudentsService.getBasicUserFields('mUser'))
      .leftJoin('student.user', 'user')
      .leftJoin('student.mentor', 'mentor')
      .leftJoin('mentor.user', 'mUser')
      .where('student.courseId = :courseId')
      .andWhere('student.isExpelled = false')
      .andWhere(
        `(
          user.githubId ILIKE :searchQuery OR
          user.firstName ILIKE :searchQuery OR
          user.lastName ILIKE :searchQuery
        )`,
        { courseId, searchQuery },
      );

    if (onlyStudentsWithoutMentorShown) {
      query.andWhere('mentor.id IS NULL');
    }

    const entities = await query.limit(20).getMany();

    return entities.map(entity => ({
      id: entity.id,
      githubId: entity.user.githubId,
      name: CourseStudentsService.buildName(entity.user),
      mentor: entity.mentor?.user
        ? {
            id: entity.mentor.id,
            githubId: entity.mentor.user.githubId,
            name: CourseStudentsService.buildName(entity.mentor.user),
          }
        : null,
    }));
  }

  private static convertToStudentDetails(student: Student) {
    const user = student.user;
    const checkers = student.taskChecker ?? [];
    const checks = checkers.map(({ courseTask: { id, task } }) => ({ id, name: task.name })) ?? [];
    const mentor = student.mentor
      ? {
          isActive: !student.mentor.isExpelled,
          name: student.mentor.user ? CourseStudentsService.buildName(student.mentor.user) : '',
          id: student.mentor.id,
          githubId: student.mentor.user?.githubId,
          students: [],
          cityName: student.mentor.user?.cityName ?? '',
          countryName: student.mentor.user?.countryName ?? '',
        }
      : null;
    return {
      name: CourseStudentsService.buildName(user),
      isActive: !student.isExpelled && !student.isFailed,
      id: student.id,
      githubId: user.githubId,
      mentor,
      cityName: user.cityName || 'Other',
      countryName: user.countryName || 'Other',
      discord: user.discord,
      totalScore: student.totalScore,
      interviews: (student.stageInterviews ?? []).map(i => ({ id: i.id, isCompleted: i.isCompleted })),
      assignedChecks: checks,
    };
  }

  private static getPrimaryUserFields(modelName = 'user') {
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

  private static getBasicUserFields(modelName = 'user') {
    return [`${modelName}.id`, `${modelName}.firstName`, `${modelName}.lastName`, `${modelName}.githubId`];
  }

  private static buildName({ firstName, lastName }: { firstName?: string | null; lastName?: string | null }) {
    const result = [];
    if (firstName) {
      result.push(firstName.trim());
    }
    if (lastName) {
      result.push(lastName.trim());
    }
    return result.join(' ');
  }

  public async setStudentMentor(studentId: number, mentorId: number | null) {
    await this.studentRepository.update(studentId, { mentorId });
  }

  public async getMenteeGithubIds(courseId: number, mentorGithubId: string): Promise<string[]> {
    const records = await this.studentRepository
      .createQueryBuilder('student')
      .select(['student.id'])
      .innerJoin('student.user', 'sUser')
      .leftJoin('student.mentor', 'mentor')
      .leftJoin('mentor.user', 'mUser')
      .addSelect(['mentor.id', 'sUser.githubId', 'mUser.githubId'])
      .where('mUser.githubId = :githubId', { githubId: mentorGithubId })
      .andWhere('student.isExpelled = false')
      .andWhere('student.courseId = :courseId ', { courseId })
      .getMany();
    return records.map(record => record.user.githubId);
  }

  public async getMentorBasicByGithubId(courseId: number, githubId: string) {
    const record = await this.mentorRepository
      .createQueryBuilder('mentor')
      .innerJoin('mentor.user', 'user')
      .addSelect(['user.id', 'user.firstName', 'user.lastName', 'user.githubId', 'user.cityName', 'user.countryName'])
      .where('user.githubId = :githubId', { githubId })
      .andWhere('mentor."courseId" = :courseId', { courseId })
      .getOne();
    if (record == null) {
      return null;
    }
    const user = record.user;
    return {
      isActive: !record.isExpelled,
      name: createName({ firstName: user.firstName, lastName: user.lastName }),
      id: record.id,
      githubId: user.githubId,
      students: [],
      cityName: user.cityName ?? '',
      countryName: user.countryName ?? '',
    };
  }

  public async getStudentWithMentor(courseId: number, githubId: string) {
    const record = await this.studentRepository
      .createQueryBuilder('student')
      .select(['student.id', 'student.isExpelled', 'student.mentorId', 'student.isFailed', 'student.totalScore'])
      .innerJoin('student.user', 'sUser')
      .leftJoin('student.mentor', 'mentor')
      .leftJoin('mentor.user', 'mUser')
      .addSelect([
        'mentor.id',
        'mentor.isExpelled',
        'mentor.userId',
        'sUser.id',
        'sUser.firstName',
        'sUser.lastName',
        'sUser.githubId',
        'sUser.cityName',
        'sUser.countryName',
        'sUser.discord',
        'mUser.id',
        'mUser.firstName',
        'mUser.lastName',
        'mUser.githubId',
        'mUser.cityName',
        'mUser.countryName',
      ])
      .where('sUser.githubId = :githubId', { githubId })
      .andWhere('student.courseId = :courseId', { courseId })
      .getOne();

    if (record == null) {
      return null;
    }

    return {
      id: record.id,
      name: createName({ firstName: record.user.firstName, lastName: record.user.lastName }),
      githubId: record.user.githubId,
      cityName: record.user.cityName ?? 'Unknown',
      countryName: record.user.countryName ?? 'Unknown',
      isActive: !record.isExpelled && !record.isFailed,
      discord: record.user.discord,
      totalScore: record.totalScore,
      mentor: record.mentor
        ? {
            id: record.mentor.id,
            name: createName({
              firstName: record.mentor.user.firstName,
              lastName: record.mentor.user.lastName,
            }),
            githubId: record.mentor.user.githubId,
            cityName: record.mentor.user.cityName ?? undefined,
            countryName: record.mentor.user.countryName ?? undefined,
            isActive: !record.mentor.isExpelled,
          }
        : null,
    };
  }

  public async canChangeStatus(
    session: IUserSession,
    courseId: number,
    githubId: string,
  ): Promise<{ allow: boolean; message?: string }> {
    const student = await this.getStudentByGithubId(courseId, githubId);
    if (student == null) {
      return {
        allow: false,
        message: 'not valid student',
      };
    }
    const isPowerUser = isAdmin(session) || isManager(session, courseId) || isSupervisor(session, courseId);
    if (isPowerUser || isDementor(session, courseId)) {
      return { allow: true };
    }

    const [interviewerGithubIds, mentor] = await Promise.all([
      this.getStudentStageInterviewerGithubIds(student.id),
      this.mentorRepository.findOne({ where: { courseId, userId: session.id } }),
    ]);
    if (mentor == null) {
      return {
        allow: false,
        message: 'not valid mentor',
      };
    }
    if (!interviewerGithubIds.includes(session.githubId) && student.mentorId !== mentor.id) {
      return {
        allow: false,
        message: 'incorrect mentor-student relation',
      };
    }
    return { allow: true };
  }

  public async expelStudent(courseId: number, githubId: string, comment = '') {
    const student = await this.getStudentByGithubId(courseId, githubId);
    if (student == null) {
      return;
    }
    await this.studentRepository.update(student.id, {
      mentorId: null,
      isExpelled: true,
      expellingReason: comment || '',
      endDate: new Date(),
    });
    await this.dataSource
      .getRepository(StageInterview)
      .update({ studentId: student.id, isCompleted: false }, { isCanceled: true });
  }

  public async setSelfStudy(courseId: number, githubId: string, comment = '') {
    const student = await this.getStudentByGithubId(courseId, githubId);
    if (student == null) {
      return;
    }
    await this.studentRepository.update(student.id, {
      mentorId: null,
      mentoring: false,
      expellingReason: comment || '',
    });
  }

  public async restoreStudent(courseId: number, githubId: string) {
    const student = await this.getStudentByGithubId(courseId, githubId);
    if (student == null) {
      return;
    }
    await this.studentRepository.update(student.id, {
      isExpelled: false,
      expellingReason: '',
      endDate: null,
    });
  }

  private async getStudentStageInterviewerGithubIds(studentId: number): Promise<string[]> {
    const interviews = await this.dataSource
      .getRepository(StageInterview)
      .createQueryBuilder('stageInterview')
      .innerJoin('stageInterview.mentor', 'mentor')
      .innerJoin('mentor.user', 'mUser')
      .addSelect(['mentor.id', 'mUser.githubId'])
      .where('stageInterview.studentId = :studentId', { studentId })
      .getMany();
    return interviews.map(it => it.mentor.user.githubId);
  }

  public async updateMentoringAvailability(studentId: number, mentoring: boolean) {
    await this.studentRepository.update(studentId, { mentoring });
  }

  async getStudentByGithubId(courseId: number, githubId: string): Promise<Student | null> {
    const record = await this.studentRepository.findOne({
      where: {
        courseId,
        user: { githubId },
      },
      relations: ['user'],
    });

    if (record == null) {
      return null;
    }
    return record;
  }

  public async getStudentScore(studentId: number) {
    const student = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.taskResults', 'taskResults')
      .leftJoin('taskResults.courseTask', 'courseTask')
      .addSelect(['courseTask.disabled', 'courseTask.id'])
      .leftJoinAndSelect('student.taskInterviewResults', 'taskInterviewResults')
      .leftJoin('student.stageInterviews', 'si')
      .leftJoin('si.stageInterviewFeedbacks', 'sif')
      .addSelect([
        'sif.stageInterviewId',
        'sif.json',
        'si.isCompleted',
        'si.id',
        'si.courseTaskId',
        'si.score',
        'sif.version',
      ])
      .where('student.id = :studentId', { studentId })
      .getOne();

    if (!student) return null;

    const { taskResults, taskInterviewResults, stageInterviews } = student;

    const toTaskScore = ({ courseTaskId, score = 0 }: TaskResult | TaskInterviewResult) => ({ courseTaskId, score });

    const results = [];

    if (taskResults?.length) {
      results.push(...(taskResults.filter(taskResult => !taskResult.courseTask.disabled).map(toTaskScore) ?? []));
    }

    if (taskInterviewResults?.length) {
      results.push(...taskInterviewResults.map(toTaskScore));
    }

    // we have a case when technical screening score are set as task result.
    if (stageInterviews?.length && !results.find(tr => tr.courseTaskId === stageInterviews[0]?.courseTaskId)) {
      const feedbackVersion = stageInterviews[0]?.stageInterviewFeedbacks[0]?.version;
      const score = !feedbackVersion
        ? Math.floor(getStageInterviewRating(stageInterviews) ?? 0)
        : stageInterviews[0]?.score;

      results.push({
        score,
        courseTaskId: stageInterviews[0]?.courseTaskId,
      });
    }

    return {
      totalScore: student.totalScore,
      rank: student.rank ?? 999999,
      results,
    };
  }

  async getMentorWithContacts(mentorId: number): Promise<MentorWithContacts> {
    const record = await this.mentorRepository.findOne({
      relations: ['user'],
      where: {
        id: mentorId,
      },
    });

    if (!record) {
      throw new NotFoundException(`Mentor not found ${mentorId}`);
    }

    const mentor = convertToMentorBasic(record);
    const user = record.user as User;
    const mentorWithContacts: MentorWithContacts = {
      ...mentor,
      contactsEmail: user.contactsEmail,
      contactsSkype: user.contactsSkype,
      contactsWhatsApp: user.contactsWhatsApp,
      contactsTelegram: user.contactsTelegram,
      contactsNotes: user.contactsNotes,
      contactsPhone: null,
    };
    return mentorWithContacts;
  }

  public async expelStudents({ courseId, expelStatusDto }: { courseId: number; expelStatusDto: ExpelStatusDto }) {
    const { criteria, options, expellingReason } = expelStatusDto;

    // duplicate updateStatuses query from the /server/src/routes/course/students.ts
    let query = this.studentRepository.createQueryBuilder('student').select(['student.id', 'student.mentorId']);

    if (criteria.courseTaskIds && criteria.courseTaskIds.length > 0) {
      query = query.leftJoin(
        'student.taskResults',
        'tr',
        'tr.studentId = student.id AND tr.score > 0 AND tr.courseTaskId IN (:...requiredCourseTaskIds)',
        {
          requiredCourseTaskIds: criteria.courseTaskIds,
        },
      );
    }

    query = query.where('student.courseId = :courseId', { courseId }).andWhere('student.isExpelled = false');

    if (options.keepWithMentor) {
      query = query.andWhere('student.mentorId IS NULL');
    }

    if (criteria.minScore != null) {
      query = query.andWhere('student.totalScore < :minScore', { minScore: criteria.minScore });
    }

    if (criteria.courseTaskIds && criteria.courseTaskIds.length > 0) {
      query = query.andWhere('tr.id IS NULL');
    }

    const students = await query.getMany();

    await this.studentRepository.save(
      students.map(({ id, mentorId }) => ({
        id,
        isExpelled: true,
        endDate: new Date(),
        expellingReason,
        // key difference with the original query - remove mentor by default
        mentorId: options.saveAssigningToMentor ? mentorId : null,
      })),
    );

    return students;
  }
}

const getStageInterviewRating = (stageInterviews: StageInterview[]) => {
  const [lastInterview] = stageInterviews
    .filter((interview: StageInterview) => interview.isCompleted)
    .map(({ stageInterviewFeedbacks, score }: StageInterview) =>
      stageInterviewFeedbacks.map((feedback: StageInterviewFeedback) => ({
        date: feedback.updatedDate,
        // interviews in new template should have precalculated score
        rating: score ?? getInterviewRatings(JSON.parse(feedback.json) as StageInterviewFeedbackJson).rating,
      })),
    )
    .reduce((acc, cur) => acc.concat(cur), [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return lastInterview?.rating ?? null;
};

export function getInterviewRatings({ skills, programmingTask, resume }: StageInterviewFeedbackJson) {
  const commonSkills = Object.values(skills?.common ?? {}).filter(Boolean) as number[];
  const dataStructuresSkills = Object.values(skills?.dataStructures ?? {}).filter(Boolean) as number[];

  const htmlCss = skills?.htmlCss.level;
  const common = commonSkills.reduce((acc, cur) => acc + cur, 0) / commonSkills.length;
  const dataStructures = dataStructuresSkills.reduce((acc, cur) => acc + cur, 0) / dataStructuresSkills.length;

  if (resume?.score !== undefined) {
    const rating = resume.score;
    return { rating, htmlCss, common, dataStructures };
  }

  const ratingsCount = 4;
  const ratings = [htmlCss, common, dataStructures, programmingTask.codeWritingLevel].filter(Boolean) as number[];
  const rating = (ratings.length === ratingsCount ? ratings.reduce((sum, num) => sum + num) / ratingsCount : 0) * 10;

  return { rating, htmlCss, common, dataStructures };
}

export function convertToMentorBasic(mentor: Mentor): MentorBasic {
  const { user, isExpelled, id, students } = mentor;
  return {
    isActive: !isExpelled,
    name: createName(user),
    id: id,
    githubId: user.githubId,
    students: students ? students.filter(s => !s.isExpelled && !s.isFailed).map(s => ({ id: s.id })) : [],
    cityName: user.cityName ?? '',
    countryName: user.countryName ?? '',
  };
}

export function createName({ firstName, lastName }: { firstName: string; lastName: string }) {
  const result = [];
  if (firstName) {
    result.push(firstName.trim());
  }
  if (lastName) {
    result.push(lastName.trim());
  }
  return result.join(' ');
}
