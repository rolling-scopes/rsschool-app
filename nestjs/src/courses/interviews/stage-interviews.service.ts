import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseTask } from '@entities/courseTask';
import { TaskType } from '@entities/task';
import { Mentor } from '@entities/mentor';
import { StageInterview } from '@entities/stageInterview';
import { StageInterviewStudent } from '@entities/stageInterviewStudent';
import { Student } from '@entities/student';
import { InterviewStatus, MentorDetails } from '@common/models';
import { createInterviews } from './stage-interview-distribution';

const STAGE_INTERVIEW_TASK_TYPE = TaskType.StageInterview;

@Injectable()
export class StageInterviewsService {
  constructor(
    @InjectRepository(StageInterview)
    readonly stageInterviewRepository: Repository<StageInterview>,
    @InjectRepository(StageInterviewStudent)
    readonly stageInterviewStudentRepository: Repository<StageInterviewStudent>,
    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,
    @InjectRepository(Mentor)
    readonly mentorRepository: Repository<Mentor>,
  ) {}

  public async findMany(courseId: number) {
    const stageInterviews = await this.stageInterviewRepository
      .createQueryBuilder('si')
      .innerJoin('si.courseTask', 'courseTask')
      .innerJoin('courseTask.task', 'task')
      .innerJoin('si.mentor', 'mentor')
      .innerJoin('si.student', 'student')
      .innerJoin('mentor.user', 'mUser')
      .innerJoin('student.user', 'sUser')
      .addSelect([
        'courseTask.id',
        'courseTask.studentStartDate',
        'courseTask.studentEndDate',
        'task.id',
        'task.name',
        'mentor.id',
        'mentor.studentsPreference',
        'student.id',
        'student.totalScore',
        ...StageInterviewsService.getPrimaryUserFields('mUser'),
        ...StageInterviewsService.getPrimaryUserFields('sUser'),
      ])
      .where('si.courseId = :courseId', { courseId })
      .andWhere(`si.isCanceled <> :canceled`, { canceled: true })
      .orderBy('si.updatedDate', 'DESC')
      .getMany();

    return stageInterviews.map(it => {
      return {
        id: it.id,
        name: it.courseTask.task.name,
        startDate: it.courseTask.studentStartDate,
        endDate: it.courseTask.studentEndDate,
        completed: it.isCompleted,
        result: null,
        status: it.isCompleted
          ? InterviewStatus.Completed
          : it.isCanceled
            ? InterviewStatus.Canceled
            : InterviewStatus.NotCompleted,
        student: {
          id: it.student.id,
          totalScore: it.student.totalScore,
          cityName: it.student.user.cityName ?? undefined,
          countryName: it.student.user.countryName ?? undefined,
          githubId: it.student.user.githubId,
          name: StageInterviewsService.createName(it.student.user),
        },
        interviewer: {
          id: it.mentor.id,
          cityName: it.mentor.user.cityName ?? undefined,
          countryName: it.mentor.user.countryName ?? undefined,
          githubId: it.mentor.user.githubId,
          name: StageInterviewsService.createName(it.mentor.user),
          preference: it.mentor.studentsPreference ?? 'any',
        },
      };
    });
  }

  public async findByInterviewer(courseId: number, githubId: string) {
    const stageInterviews = await this.stageInterviewRepository
      .createQueryBuilder('stageInterview')
      .innerJoin('stageInterview.courseTask', 'courseTask')
      .innerJoin('courseTask.task', 'task')
      .innerJoin('stageInterview.mentor', 'mentor')
      .innerJoin('stageInterview.student', 'student')
      .innerJoin('mentor.user', 'mUser')
      .innerJoin('student.user', 'sUser')
      .addSelect([
        'courseTask.id',
        'task.id',
        'task.name',
        'task.descriptionUrl',
        'courseTask.studentStartDate',
        'courseTask.studentEndDate',
        'student.id',
        'mentor.id',
        ...StageInterviewsService.getPrimaryUserFields('mUser'),
        ...StageInterviewsService.getPrimaryUserFields('sUser'),
      ])
      .where(`stageInterview.courseId = :courseId AND mUser.githubId = :githubId`, { courseId, githubId })
      .andWhere(`stageInterview.isCanceled <> :canceled`, { canceled: true })
      .andWhere('student.isExpelled = false')
      .getMany();

    return stageInterviews.map(it => {
      return {
        id: it.id,
        name: it.courseTask.task.name,
        completed: it.isCompleted,
        status: it.isCompleted
          ? InterviewStatus.Completed
          : it.isCanceled
            ? InterviewStatus.Canceled
            : InterviewStatus.NotCompleted,
        descriptionUrl: it.courseTask.task.descriptionUrl,
        startDate: it.courseTask.studentStartDate,
        endDate: it.courseTask.studentEndDate,
        result: it.decision ?? null,
        interviewer: {
          githubId: it.mentor.user.githubId,
          name: StageInterviewsService.createName(it.mentor.user),
        },
        decision: it.decision,
        student: {
          id: it.student.id,
          githubId: it.student.user.githubId,
          name: StageInterviewsService.createName(it.student.user),
        },
      };
    });
  }

  public async create(courseId: number, studentGithubId: string, interviewerGithubId: string) {
    const courseTask = await this.courseTaskRepository.findOne({
      where: { courseId, type: STAGE_INTERVIEW_TASK_TYPE, disabled: false },
    });

    const [student, interviewer] = await Promise.all([
      this.queryStudentByGithubId(courseId, studentGithubId),
      this.queryMentorByGithubId(courseId, interviewerGithubId),
    ]);

    if (courseTask == null || student == null || interviewer == null) {
      return null;
    }

    const interview = await this.stageInterviewRepository.save({
      courseId,
      mentorId: interviewer.id,
      studentId: student.id,
      courseTaskId: courseTask.id,
    });

    return interview;
  }

  public async updateInterviewer(id: number, githubId: string) {
    const interview = await this.stageInterviewRepository.findOneBy({ id });
    if (interview) {
      const mentor = await this.queryMentorByGithubId(interview.courseId, githubId);
      if (mentor) {
        await this.stageInterviewRepository.update(id, { mentorId: mentor.id });
      }
    }
  }

  public cancel(interviewId: number) {
    return this.stageInterviewRepository.update(interviewId, { isCanceled: true });
  }

  public async createAutomatically(courseId: number, noRegistration = false) {
    const courseTasks = await this.courseTaskRepository.find({
      where: { courseId, type: STAGE_INTERVIEW_TASK_TYPE, disabled: false },
    });
    if (courseTasks.length === 0) {
      return [];
    }
    if (courseTasks.length > 1) {
      throw new Error('More than one stage interview task');
    }
    const [courseTask] = courseTasks;
    const mentors = await this.getMentorsWithStudents(courseId);

    const students = noRegistration
      ? await this.getActiveStudents(courseId)
      : await this.findRegisteredStudents(courseId);
    const interviews = await this.findMany(courseId);

    const distibution = createInterviews(mentors, students, interviews);

    const result = await this.stageInterviewRepository.save(
      distibution.map(pair => ({
        courseTaskId: courseTask?.id,
        courseId,
        mentorId: pair.mentor.id,
        studentId: pair.student.id,
      })),
    );

    return result;
  }

  public async queryMentorByGithubId(courseId: number, githubId: string) {
    const record = await this.mentorRepository
      .createQueryBuilder('mentor')
      .innerJoin('mentor.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.githubId'])
      .where('user.githubId = :githubId', { githubId })
      .andWhere('mentor.courseId = :courseId', { courseId })
      .getOne();
    if (record == null) {
      return null;
    }
    return { id: record.id, name: StageInterviewsService.createName(record.user), githubId: record.user.githubId };
  }

  public async queryMentorById(courseId: number, mentorId: number) {
    const record = await this.mentorRepository
      .createQueryBuilder('mentor')
      .innerJoin('mentor.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.githubId'])
      .where('mentor.id = :mentorId', { mentorId })
      .andWhere('mentor.courseId = :courseId', { courseId })
      .getOne();
    if (record == null) {
      return null;
    }
    return { id: record.id, name: StageInterviewsService.createName(record.user), githubId: record.user.githubId };
  }

  public async queryStudentByGithubId(courseId: number, githubId: string) {
    const record = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.githubId', 'user.id'])
      .where('user.githubId = :githubId', { githubId })
      .andWhere('student.courseId = :courseId', { courseId })
      .getOne();
    if (record == null) {
      return null;
    }
    return {
      id: record.id,
      name: StageInterviewsService.createName(record.user),
      githubId: record.user.githubId,
      userId: record.user.id,
    };
  }

  public async queryStudentById(courseId: number, studentId: number) {
    const record = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.githubId', 'user.id'])
      .where('student.id = :studentId', { studentId })
      .andWhere('student.courseId = :courseId', { courseId })
      .getOne();
    if (record == null) {
      return null;
    }
    return {
      id: record.id,
      name: StageInterviewsService.createName(record.user),
      githubId: record.user.githubId,
      userId: record.user.id,
    };
  }

  private async getMentorsWithStudents(courseId: number): Promise<MentorDetails[]> {
    const records = await this.mentorRepository
      .createQueryBuilder('mentor')
      .innerJoin('mentor.user', 'user')
      .addSelect(StageInterviewsService.getPrimaryUserFields())
      .leftJoinAndSelect('mentor.students', 'students')
      .where(`mentor.courseId = :courseId`, { courseId })
      .andWhere('mentor.isExpelled = false')
      .orderBy('mentor.createdDate')
      .getMany();

    return records.map(mentor => {
      const user = mentor.user;
      const students = mentor.students ?? [];
      return {
        isActive: !mentor.isExpelled,
        name: StageInterviewsService.createName(user),
        id: mentor.id,
        githubId: user.githubId,
        students,
        cityName: user.cityName ?? '',
        countryName: user.countryName ?? '',
        maxStudentsLimit: mentor.maxStudentsLimit,
        studentsPreference: mentor.studentsPreference ?? 'any',
        studentsCount: students.length,
        screenings: { total: 0 },
      } as unknown as MentorDetails;
    });
  }

  private async getActiveStudents(courseId: number) {
    const records = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .addSelect(StageInterviewsService.getPrimaryUserFields())
      .innerJoin('student.course', 'course')
      .leftJoinAndSelect('student.mentor', 'mentor')
      .leftJoin('mentor.user', 'mentorUser')
      .addSelect(StageInterviewsService.getPrimaryUserFields('mentorUser'))
      .where(`course.id = :courseId AND student."isExpelled" = false`, { courseId })
      .orderBy('student.totalScore', 'DESC')
      .getMany();

    return records.map(record => ({
      id: record.id,
      name: StageInterviewsService.createName(record.user),
      githubId: record.user.githubId,
      cityName: record.user.cityName || 'Other',
      countryName: record.user.countryName || 'Other',
      mentor: record.mentor ? { id: record.mentor.id } : null,
      totalScore: record.totalScore,
    }));
  }

  private async findRegisteredStudents(courseId: number) {
    const records = await this.stageInterviewStudentRepository
      .createQueryBuilder('sis')
      .innerJoin('sis.student', 'student')
      .innerJoin('student.user', 'user')
      .addSelect([
        'student.id',
        'student.totalScore',
        'student.mentorId',
        ...StageInterviewsService.getPrimaryUserFields('user'),
      ])
      .where('sis.courseId = :courseId AND student.isExpelled = false AND student.mentorId IS NULL', { courseId })
      .getMany();

    return records.map(record => ({
      id: record.student.id,
      name: StageInterviewsService.createName(record.student.user),
      githubId: record.student.user.githubId,
      cityName: record.student.user.cityName ?? 'Other',
      countryName: record.student.user.countryName ?? 'Other',
      mentor: record.student.mentorId ? { id: record.student.mentorId } : null,
      totalScore: record.student.totalScore,
    }));
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

  private static createName({ firstName, lastName }: { firstName?: string | null; lastName?: string | null }) {
    const result = [];
    if (firstName) {
      result.push(firstName.trim());
    }
    if (lastName) {
      result.push(lastName.trim());
    }
    return result.join(' ');
  }
}
