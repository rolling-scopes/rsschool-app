import { In, Repository, Brackets } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InterviewPair, InterviewStatus, StageInterviewFeedbackJson } from '@common/models';
import { CourseTask } from '@entities/courseTask';
import { StageInterview } from '@entities/stageInterview';
import { TaskInterviewStudent } from '@entities/taskInterviewStudent';
import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { TaskChecker } from '@entities/taskChecker';
import { UsersService } from 'src/users/users.service';
import { Mentor, StageInterviewStudent, Student } from '@entities/index';
import { AvailableStudentDto } from './dto/available-student.dto';
import { TaskType } from '@entities/task';
import { CrossMentorDistributionService } from './cross-mentor-distribution.service';
import { InterviewDistributeDto } from './dto/interview-distribute.dto';
import { UserNotificationsService } from 'src/users-notifications';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
    @InjectRepository(TaskInterviewStudent)
    readonly taskInterviewStudentRepository: Repository<TaskInterviewStudent>,
    @InjectRepository(TaskChecker)
    readonly taskCheckerRepository: Repository<TaskChecker>,
    @InjectRepository(TaskInterviewResult)
    readonly taskInterviewResultRepository: Repository<TaskInterviewResult>,
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,
    @InjectRepository(StageInterviewStudent)
    readonly stageInterviewStudentRepository: Repository<StageInterviewStudent>,
    @InjectRepository(Mentor)
    readonly mentorRepository: Repository<Mentor>,
    @InjectRepository(StageInterview)
    readonly stageInterviewRepository: Repository<StageInterview>,
    @InjectRepository(TaskInterviewStudent)
    readonly interviewRepository: Repository<TaskInterviewStudent>,
    private crossMentorService: CrossMentorDistributionService,
    private userNotificationsService: UserNotificationsService,
  ) {}

  public getAll(
    courseId: number,
    filter: {
      disabled?: boolean;
      types?: TaskType[];
    },
  ) {
    const { disabled = false, types = [TaskType.Interview] } = filter;
    return this.courseTaskRepository.find({
      where: { courseId, type: In(types), disabled },
      relations: ['task'],
    });
  }

  public getById(id: number) {
    return this.courseTaskRepository.findOne({
      where: { id },
      relations: ['task'],
    });
  }

  public static getLastStageInterview = (stageInterviews: StageInterview[]) => {
    const [lastInterview] = stageInterviews
      .filter(interview => interview.isCompleted)
      .map(({ stageInterviewFeedbacks, score, courseTask }) =>
        stageInterviewFeedbacks.map(feedback => ({
          date: feedback.updatedDate,
          rating:
            score ??
            InterviewsService.getInterviewRatings(JSON.parse(feedback.json) as StageInterviewFeedbackJson).rating,
          version: feedback.version,
          maxScore: courseTask?.maxScore,
        })),
      )
      .reduce((acc, cur) => acc.concat(cur), [])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return lastInterview;
  };

  public async getInterviewRegisteredStudents(courseId: number, courseTaskId: number): Promise<AvailableStudentDto[]> {
    const records = await this.taskInterviewStudentRepository
      .createQueryBuilder('is')
      .innerJoin('is.student', 'student')
      .innerJoin('student.user', 'user')
      .leftJoin('student.taskChecker', 'taskChecker', 'taskChecker.courseTaskId = :courseTaskId', { courseTaskId })
      .addSelect([
        'student.id',
        'student.totalScore',
        'student.mentorId',
        ...UsersService.getPrimaryUserFields(),
        'taskChecker.id',
      ])
      .where('is.courseId = :courseId', { courseId })
      .andWhere('is.courseTaskId = :courseTaskId', { courseTaskId })
      .andWhere('student.isExpelled = false')
      .andWhere('taskChecker.id IS NULL')
      .orderBy('student.totalScore', 'DESC')
      .getMany();

    return records.map(record => ({
      id: record.student.id,
      name: UsersService.getFullName(record.student.user),
      githubId: record.student.user.githubId,
      cityName: record.student.user.cityName,
      countryName: record.student.user.countryName,
      totalScore: record.student.totalScore,
      registeredDate: record.createdDate,
    }));
  }

  public async getInterviewPairs(courseTaskId: number): Promise<InterviewPair[]> {
    const records = await this.taskCheckerRepository
      .createQueryBuilder('tc')
      .leftJoin('tc.mentor', 'mentor')
      .leftJoin('tc.student', 'student')
      .leftJoin('mentor.user', 'mentorUser')
      .leftJoin('student.user', 'studentUser')
      .leftJoin(
        TaskInterviewResult,
        'tir',
        'tc.studentId = tir.studentId AND tc.courseTaskId = tir.courseTaskId AND tc.mentorId = tir.mentorId',
      )
      .addSelect([
        'tc.id',
        'tir.score',
        'mentorUser.id',
        'mentorUser.firstName',
        'mentorUser.lastName',
        'mentorUser.githubId',
        'studentUser.id',
        'studentUser.firstName',
        'studentUser.lastName',
        'studentUser.githubId',
      ])
      .where('tc.courseTaskId = :courseTaskId', { courseTaskId })
      .getRawMany();

    return records.map(record => ({
      id: record.tc_id,
      result: record.tir_score,
      status: record.tir_score || record.tir_score === 0 ? InterviewStatus.Completed : InterviewStatus.NotCompleted,
      interviewer: {
        id: record.mentorUser_id,
        githubId: record.mentorUser_githubId,
        name: UsersService.getFullName({
          firstName: record.mentorUser_firstName,
          lastName: record.mentorUser_lastName,
        }),
      },
      student: {
        id: record.studentUser_id,
        githubId: record.studentUser_githubId,
        name: UsersService.getFullName({
          firstName: record.studentUser_firstName,
          lastName: record.studentUser_lastName,
        }),
      },
    }));
  }

  public async getStageInterviewAvailableStudents(courseId: number): Promise<AvailableStudentDto[]> {
    const { entities, raw } = await this.buildAvailableStudentsQuery(courseId).getRawAndEntities();
    const registrationDateByStudentId = InterviewsService.mapRegistrationDates(raw);

    return entities
      .filter(student => InterviewsService.isAvailableForStageInterview(student))
      .map(student => this.mapToAvailableStudentDto(student, registrationDateByStudentId.get(student.id) ?? ''));
  }

  /**
   * Build a studentId → registration date lookup from the raw rows once, so mapping is O(1) per
   * student instead of scanning `raw` (which the left joins can inflate) for every student.
   */
  private static mapRegistrationDates(raw: { student_id: number; sis_createdDate: string }[]): Map<number, string> {
    const registrationDateByStudentId = new Map<number, string>();
    for (const row of raw) {
      if (!registrationDateByStudentId.has(row.student_id)) {
        registrationDateByStudentId.set(row.student_id, row.sis_createdDate);
      }
    }
    return registrationDateByStudentId;
  }

  /**
   * Registered, mentoring-eligible students of the course (not failed, not expelled, no mentor yet),
   * with their stage interviews, feedbacks and registration date joined for downstream mapping.
   */
  private buildAvailableStudentsQuery(courseId: number) {
    return this.studentRepository
      .createQueryBuilder('student')
      .innerJoin(StageInterviewStudent, 'sis', 'sis.studentId = student.id')
      .innerJoin('student.user', 'user')
      .leftJoin('student.stageInterviews', 'si')
      .leftJoin('si.stageInterviewFeedbacks', 'sif')
      .leftJoin('si.courseTask', 'courseTask')
      .addSelect([
        ...UsersService.getPrimaryUserFields(),
        'si.id',
        'si.isGoodCandidate',
        'si.isCompleted',
        'si.isCanceled',
        'si.score',
        'si.decision',
        'sif.json',
        'sif.updatedDate',
        'sif.version',
        'sis.createdDate',
        'courseTask.maxScore',
      ])
      .where(
        [
          `student.courseId = :courseId`,
          `student.isFailed = false`,
          `student.isExpelled = false`,
          `student.mentorId IS NULL`,
          `student.mentoring <> false`,
        ].join(' AND '),
        { courseId },
      )
      .orderBy('student.totalScore', 'DESC');
  }

  /**
   * A student is available for a new stage interview when they have no interviews yet, or every
   * existing interview is either canceled or completed with a final (non-draft) decision.
   */
  private static isAvailableForStageInterview(student: Student): boolean {
    const interviews = student.stageInterviews;
    return (
      !interviews ||
      interviews.length === 0 ||
      interviews.every(interview => (interview.isCompleted && interview.decision !== 'draft') || interview.isCanceled)
    );
  }

  private mapToAvailableStudentDto(student: Student, registeredDate: string): AvailableStudentDto {
    const stageInterviews: StageInterview[] = student.stageInterviews || [];
    const lastStageInterview = InterviewsService.getLastStageInterview(stageInterviews);

    return {
      id: student.id,
      totalScore: student.totalScore,
      githubId: student.user.githubId,
      name: UsersService.getFullName(student.user),
      cityName: student.user.cityName,
      countryName: student.user.countryName,
      isGoodCandidate: this.isGoodCandidate(stageInterviews),
      rating: lastStageInterview?.rating,
      maxScore: lastStageInterview?.maxScore,
      feedbackVersion: lastStageInterview?.version,
      registeredDate,
    };
  }

  /**
   * @deprecated - should be removed once Artsiom A. makes migration of the legacy feedback format
   */
  private static getInterviewRatings({ skills, programmingTask, resume }: StageInterviewFeedbackJson) {
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

  private isGoodCandidate(stageInterviews: StageInterview[]) {
    return stageInterviews.some(i => i.isCompleted && i.isGoodCandidate);
  }

  public async registerStudentToStageInterview(courseId: number, githubId: string) {
    const student = await this.studentRepository.findOneOrFail({ where: { courseId, user: { githubId } } });
    if (student.isExpelled) {
      throw new BadRequestException('Student is expelled');
    }

    const studentId = student.id;
    const record = await this.stageInterviewStudentRepository.findOne({ where: { courseId, studentId } });
    if (record) {
      throw new BadRequestException('Student is already registered');
    }
    await this.stageInterviewStudentRepository.insert({ courseId, studentId });
    return this.stageInterviewStudentRepository.findOneByOrFail({ courseId, studentId });
  }

  public async registerStudentToInterview(courseId: number, courseTaskId: number, githubId: string) {
    const student = await this.studentRepository.findOneOrFail({ where: { courseId, user: { githubId } } });
    if (student.isExpelled) {
      throw new BadRequestException('Student is expelled');
    }

    const record = await this.taskInterviewStudentRepository.findOne({
      where: { courseId, studentId: student.id, courseTaskId },
    });
    if (record) {
      throw new BadRequestException('Student is already registered');
    }

    const taskInterviewStudent = await this.taskInterviewStudentRepository.save({
      courseId,
      studentId: student.id,
      courseTaskId,
    });
    return taskInterviewStudent;
  }

  public async distributeInterviewPairs(
    courseId: number,
    courseTaskId: number,
    { clean, registrationEnabled }: InterviewDistributeDto,
  ) {
    const courseTask = await this.courseTaskRepository.findOne({ where: { id: courseTaskId }, select: ['id'] });

    if (!courseTask) {
      return null;
    }

    const mentors = await this.mentorRepository
      .createQueryBuilder('mentor')
      .innerJoinAndSelect('mentor.user', 'user')
      .leftJoinAndSelect('mentor.students', 'students')
      .where('mentor.courseId = :courseId', { courseId })
      .andWhere('mentor.isExpelled = false')
      .andWhere('(students.isExpelled = false OR students IS NULL)')
      .getMany();

    if (mentors.length === 0) {
      return [];
    }

    if (clean) {
      await this.taskCheckerRepository.delete({ courseTaskId });
    }

    let registeredStudentsIds: number[] | undefined = undefined;

    if (registrationEnabled) {
      const students = await this.interviewRepository.find({
        where: { courseId, courseTaskId },
        select: ['studentId'],
      });
      registeredStudentsIds = students.map(s => s.studentId);
    }

    const existingPairs: TaskChecker[] = clean
      ? []
      : await this.taskCheckerRepository.find({ where: { courseTaskId } });

    const { mentors: crossMentors } = this.crossMentorService.distribute(mentors, existingPairs, registeredStudentsIds);

    const taskCheckPairs = crossMentors
      .map(stm => stm.students?.map(s => ({ courseTaskId, mentorId: stm.id, studentId: s.id })) ?? [])
      .reduce((acc, student) => acc.concat(student), []);

    if (taskCheckPairs.length > 0) {
      await this.taskCheckerRepository.save(taskCheckPairs);

      await Promise.all(
        taskCheckPairs.map(async pair => {
          const student = await this.studentRepository.findOne({
            where: { courseId, id: pair.studentId },
            relations: ['user'],
          });
          const mentor = await this.mentorRepository.findOne({
            where: { courseId, id: pair.mentorId },
            relations: ['user'],
            select: ['id', 'user'],
          });
          if (student && mentor) {
            const interviewerFirstName = !mentor.user.firstName ? '' : mentor.user.firstName.trim();
            const interviewerLastName = !mentor.user.lastName ? '' : mentor.user.lastName.trim();
            const interviewerFullName = `${interviewerFirstName}${interviewerFirstName ? ' ' : ''}${interviewerLastName}`;
            await this.userNotificationsService.sendEventNotification({
              userId: student.user.id,
              notificationId: 'interviewerAssigned',
              data: {
                interviewer: {
                  id: mentor.id,
                  githubId: mentor.user.githubId,
                  name: interviewerFullName,
                },
              },
            });
          }
        }),
      );
    }

    return taskCheckPairs;
  }

  public async isInterviewStarted(courseTaskId: number) {
    const courseTask = await this.courseTaskRepository.findOne({
      where: { id: courseTaskId },
      select: ['studentStartDate'],
    });
    return courseTask?.studentStartDate ? new Date(courseTask.studentStartDate).getTime() < Date.now() : false;
  }

  public async addInterviewPair(
    courseId: number,
    courseTaskId: number,
    interviewerGithubId: string,
    studentGithubId: string,
  ) {
    const [interviewer, student] = await Promise.all([
      this.mentorRepository
        .createQueryBuilder('mentor')
        .innerJoin('mentor.user', 'user')
        .addSelect(['user.id', 'user.firstName', 'user.lastName', 'user.githubId'])
        .where('user.githubId = :githubId', { githubId: interviewerGithubId })
        .andWhere('mentor.courseId = :courseId', { courseId })
        .getOne(),
      this.studentRepository
        .createQueryBuilder('student')
        .innerJoin('student.user', 'user')
        .addSelect(['user.id', 'user.firstName', 'user.lastName', 'user.githubId'])
        .where('user.githubId = :githubId', { githubId: studentGithubId })
        .andWhere('student.courseId = :courseId', { courseId })
        .getOne(),
    ]);
    if (!interviewer || !student) {
      return null;
    }

    const record = {
      courseTaskId,
      studentId: student.id,
      mentorId: interviewer.id,
    };
    const current = await this.taskCheckerRepository.findOne({ where: record });
    let pairId: number;
    if (!current) {
      const {
        identifiers: [identifier],
      } = await this.taskCheckerRepository.insert(record);
      pairId = Number(identifier?.['id']);
    } else {
      pairId = current.id;
    }

    return {
      id: pairId,
      interviewer: {
        id: interviewer.id,
        name: InterviewsService.createName(interviewer.user),
        githubId: interviewer.user.githubId,
      },
      studentUserId: student.user.id,
    };
  }

  public cancelInterviewPair(pairId: number) {
    return this.taskCheckerRepository.delete(pairId);
  }

  public async getRegisteredInterviewStudent(
    courseId: number,
    githubId: string,
    interviewId: string,
  ): Promise<{ id: number } | null | undefined> {
    const student = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .where('user.githubId = :githubId', { githubId })
      .andWhere('student.courseId = :courseId', { courseId })
      .getOne();
    if (student == null) {
      return undefined;
    }
    if (interviewId === 'stage') {
      const record = await this.stageInterviewStudentRepository.findOne({
        where: { courseId, studentId: student.id },
      });
      return record ? { id: record.id } : null;
    }
    const record = await this.taskInterviewStudentRepository.findOne({
      where: { courseId, studentId: student.id, courseTaskId: Number(interviewId) },
    });
    return record ? { id: record.id } : null;
  }

  public async getUserInterviewDetails(courseId: number, githubId: string, type: 'student' | 'mentor') {
    const [interviews, stageInterviews] = await Promise.all([
      this.getRegularInterviewDetails(courseId, githubId, type),
      this.getStageInterviewDetails(courseId, githubId, type),
    ]);
    return (stageInterviews as object[]).concat(interviews);
  }

  private async getRegularInterviewDetails(courseId: number, githubId: string, type: 'student' | 'mentor') {
    const person =
      type === 'mentor'
        ? await this.mentorRepository
            .createQueryBuilder('mentor')
            .innerJoin('mentor.user', 'user')
            .where('user.githubId = :githubId', { githubId })
            .andWhere('mentor.courseId = :courseId', { courseId })
            .getOne()
        : await this.studentRepository
            .createQueryBuilder('student')
            .innerJoin('student.user', 'user')
            .where('user.githubId = :githubId', { githubId })
            .andWhere('student.courseId = :courseId', { courseId })
            .getOne();

    if (person == null) {
      return [];
    }

    const interviews = await this.taskCheckerRepository
      .createQueryBuilder('taskChecker')
      .innerJoin('taskChecker.courseTask', 'courseTask')
      .innerJoin('courseTask.task', 'task')
      .innerJoin('taskChecker.mentor', 'mentor')
      .innerJoin('mentor.user', 'mUser')
      .innerJoin('taskChecker.student', 'student')
      .innerJoin('student.user', 'sUser')
      .addSelect([
        'courseTask.id',
        'courseTask.studentStartDate',
        'courseTask.studentEndDate',
        'mentor.id',
        'student.id',
        'task.id',
        'task.name',
        'task.descriptionUrl',
        'task.attributes',
        ...InterviewsService.getPrimaryUserFields('mUser'),
        ...InterviewsService.getPrimaryUserFields('sUser'),
      ])
      .where(`taskChecker.${type === 'mentor' ? 'mentorId' : 'studentId'} = :id`, { id: person.id })
      .andWhere('task.type = :type', { type: 'interview' })
      .getMany();

    if (interviews.length === 0) {
      return [];
    }

    const taskResults = await this.taskInterviewResultRepository
      .createQueryBuilder('tir')
      .where(
        new Brackets(qb => {
          interviews.forEach((i, index) => {
            qb.orWhere(`(tir.courseTaskId = :courseTaskId${index} AND tir.mentorId = :mentorId${index})`, {
              [`courseTaskId${index}`]: i.courseTaskId,
              [`mentorId${index}`]: i.mentor.id,
            });
          });
        }),
      )
      .getMany();

    return interviews.map(record => {
      const { courseTask } = record;
      const taskResult = taskResults.find(
        taskResult => taskResult.courseTaskId === record.courseTaskId && record.student.id === taskResult.studentId,
      );
      return {
        id: courseTask.id,
        name: courseTask.task.name,
        descriptionUrl: courseTask.task.descriptionUrl,
        startDate: courseTask.studentStartDate as string,
        endDate: courseTask.studentEndDate as string,
        completed: !!taskResult,
        status: taskResult ? InterviewStatus.Completed : InterviewStatus.NotCompleted,
        interviewer: {
          githubId: record.mentor.user.githubId,
          name: InterviewsService.createName(record.mentor.user),
        },
        student: {
          id: record.student.id,
          githubId: record.student.user.githubId,
          name: InterviewsService.createName(record.student.user),
        },
        result: taskResult?.score?.toString() ?? null,
      };
    });
  }

  private async getStageInterviewDetails(courseId: number, githubId: string, userType: 'student' | 'mentor') {
    const userKey = userType === 'student' ? 'sUser' : 'mUser';

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
        ...InterviewsService.getPrimaryUserFields('mUser'),
        ...InterviewsService.getPrimaryUserFields('sUser'),
      ])
      .where(`stageInterview.courseId = :courseId AND ${userKey}.githubId = :githubId`, { courseId, githubId })
      .andWhere(`stageInterview.isCanceled <> :canceled`, { canceled: true })
      .andWhere(`${userType === 'student' ? 'mentor' : 'student'}.isExpelled = false`)
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
        interviewer: { githubId: it.mentor.user.githubId, name: InterviewsService.createName(it.mentor.user) },
        decision: it.decision,
        student: {
          id: it.student.id,
          githubId: it.student.user.githubId,
          name: InterviewsService.createName(it.student.user),
        },
      };
    });
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

  public async getInterviewStudentsByMentor(courseId: number, courseTaskId: number, mentorGithubId: string) {
    const mentor = await this.mentorRepository
      .createQueryBuilder('mentor')
      .innerJoin('mentor.user', 'user')
      .addSelect(['user.firstName', 'user.lastName', 'user.githubId'])
      .where('user.githubId = :githubId', { githubId: mentorGithubId })
      .andWhere('mentor.courseId = :courseId', { courseId })
      .getOne();
    if (mentor == null) {
      return null;
    }

    const records = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .innerJoin('student.taskChecker', 'taskChecker')
      .addSelect([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.githubId',
        'user.cityName',
        'user.countryName',
        'user.discord',
      ])
      .where('"taskChecker"."courseTaskId" = :courseTaskId', { courseTaskId })
      .andWhere('"taskChecker"."mentorId" = :mentorId', { mentorId: mentor.id })
      .getMany();

    return records.map(record => ({
      name: [record.user.firstName, record.user.lastName]
        .filter(Boolean)
        .map(s => s.trim())
        .join(' '),
      isActive: !record.isExpelled && !record.isFailed,
      id: record.id,
      githubId: record.user.githubId,
      mentor: null,
      cityName: record.user.cityName ?? '',
      countryName: record.user.countryName ?? '',
      discord: record.user.discord,
      totalScore: record.totalScore,
    }));
  }

  public async createInterviewResult(
    courseId: number,
    courseTaskId: number,
    githubId: string,
    userId: number,
    inputData: {
      score: number | string;
      comment?: string;
      formAnswers?: { questionId: string; questionText: string; answer: string }[];
    },
  ): Promise<{ ok: boolean; message?: string }> {
    if (inputData.score == null) {
      return { ok: false, message: 'no score' };
    }

    const [student, mentor] = await Promise.all([
      this.studentRepository
        .createQueryBuilder('student')
        .innerJoin('student.user', 'user')
        .where('user.githubId = :githubId', { githubId })
        .andWhere('student.courseId = :courseId', { courseId })
        .getOne(),
      this.mentorRepository
        .createQueryBuilder('mentor')
        .where('mentor."courseId" = :courseId AND mentor."userId" = :userId', { userId, courseId })
        .getOne(),
    ]);

    if (student == null || mentor == null) {
      return { ok: false, message: 'not valid student or mentor' };
    }

    const courseTask = await this.courseTaskRepository
      .createQueryBuilder('courseTask')
      .where('courseTask.id = :courseTaskId', { courseTaskId: Number(courseTaskId) })
      .getOne();
    if (courseTask == null) {
      return { ok: false, message: 'not valid course task' };
    }

    const repository = this.taskInterviewResultRepository;
    const existingResult = await repository
      .createQueryBuilder('taskInterviewResult')
      .where('"taskInterviewResult"."studentId" = :studentId', { studentId: student.id })
      .andWhere('"taskInterviewResult"."courseTaskId" = :courseTaskId', { courseTaskId: courseTask.id })
      .andWhere('"taskInterviewResult"."mentorId" = :mentorId', { mentorId: mentor.id })
      .getOne();

    if (existingResult != null) {
      await repository.update(existingResult.id, {
        formAnswers: inputData.formAnswers,
        score: Math.round(Number(inputData.score)),
        comment: inputData.comment || '',
      });
      return { ok: true };
    }

    await repository.insert({
      mentorId: mentor.id,
      studentId: student.id,
      formAnswers: inputData.formAnswers,
      score: Math.round(Number(inputData.score)),
      comment: inputData.comment || '',
      courseTaskId: courseTask.id,
    });
    return { ok: true };
  }
}
