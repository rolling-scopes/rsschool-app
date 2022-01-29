import _ from 'lodash';
import moment from 'moment';
import { getRepository, getManager, getCustomRepository } from 'typeorm';
import { MentorBasic, StudentBasic } from '../../../common/models';
import {
  Course,
  CourseTask,
  Mentor,
  Student,
  User,
  CourseEvent,
  TaskSolution,
  CourseUser,
  TaskSolutionChecker,
  TaskChecker,
  TaskSolutionResult,
  IUserSession,
  TaskResult,
  TaskInterviewResult,
  isAdmin,
  isManager,
  isSupervisor,
} from '../models';
import { createName } from './user.service';
import { StageInterviewRepository } from '../repositories/stageInterview.repository';
import { MentorRepository } from '../repositories/mentor.repository';
import { getStageInterviewRating } from './stageInterview.service';

export const getPrimaryUserFields = (modelName = 'user') => [
  `${modelName}.id`,
  `${modelName}.firstName`,
  `${modelName}.lastName`,
  `${modelName}.githubId`,
  `${modelName}.cityName`,
  `${modelName}.countryName`,
  `${modelName}.discord`,
];

export const getContactsUserFields = (modelName = 'user') => [
  `${modelName}.primaryEmail`,
  `${modelName}.contactsPhone`,
  `${modelName}.contactsEmail`,
  `${modelName}.contactsTelegram`,
  `${modelName}.contactsLinkedIn`,
  `${modelName}.contactsSkype`,
];

export async function getCourseMentor(courseId: number, userId: number): Promise<{ id: number } | undefined> {
  return await getRepository(Mentor)
    .createQueryBuilder('mentor')
    .where('mentor."courseId" = :courseId AND mentor."userId" = :userId', { userId, courseId })
    .getOne();
}

export interface MentorWithContacts
  extends MentorBasic,
    Pick<User, 'contactsEmail' | 'contactsPhone' | 'contactsSkype' | 'contactsTelegram' | 'contactsNotes'> {}

export interface AssignedStudent extends StudentBasic {
  courseTaskId: number | null;
}

export interface StudentDetails extends StudentBasic {
  cityName: string;
  countryName: string;
  totalScore: number;
  interviews: { id: number; isCompleted: boolean; interviewer?: { githubId: string } }[];
  repository: string;
  assignedChecks: { name: string; id: number }[];
}

export interface StudentWithResults {
  id: number;
  name: string;
  githubId: string;
  mentor?: { name: string; githubId: string };
  totalScore: number;
  totalScoreChangeDate: Date;
  rank: number;
  cityName: string;
  countryName: string;
  isActive: boolean;
  taskResults: { courseTaskId: number; score: number }[];
}

export interface MentorDetails extends MentorBasic {
  cityName: string;
  countryName: string;
  maxStudentsLimit: number;
  studentsPreference: 'any' | 'city' | 'country';
  interviews?: {
    completed?: number;
    total?: number;
  };
  screenings?: {
    completed?: number;
    total?: number;
  };
  studentsCount?: number;
  taskResultsStats?: {
    total: number;
    checked: number;
  };
}

export function convertToMentorBasic(mentor: Mentor): MentorBasic {
  const user = (mentor.user as User)!;
  return {
    isActive: !mentor.isExpelled,
    name: createName(user),
    id: mentor.id,
    githubId: user.githubId,
    students: mentor.students ? mentor.students.filter(s => !s.isExpelled && !s.isFailed).map(s => ({ id: s.id })) : [],
    cityName: user.cityName ?? '',
    countryName: user.countryName ?? '',
  };
}

export function convertToStudentBasic(student: Student): StudentBasic {
  const user = (student.user as User)!;
  return {
    name: createName(user),
    isActive: !student.isExpelled && !student.isFailed,
    id: student.id,
    githubId: user.githubId,
    mentor: student.mentor ? convertToMentorBasic(student.mentor) : null,
    cityName: user.cityName ?? '',
    countryName: user.countryName ?? '',
    discord: user.discord ? `${user.discord.username}#${user.discord.discriminator}` : '',
    totalScore: student.totalScore,
  };
}

export function convertToStudentDetails(student: Student): StudentDetails {
  const studentBasic = convertToStudentBasic(student);
  const user = (student.user as User)!;
  const checkers: TaskChecker[] = student.taskChecker ?? [];
  const checks = checkers.map(({ courseTask: { id, task } }) => ({ id, name: task.name })) ?? [];
  return {
    ...studentBasic,
    totalScore: student.totalScore,
    cityName: user.cityName || 'Other',
    countryName: user.countryName || 'Other',
    interviews: _.isEmpty(student.stageInterviews)
      ? []
      : student.stageInterviews!.map(i => ({
          id: i.id,
          isCompleted: i.isCompleted,
        })),
    repository: student.repository,
    assignedChecks: checks,
  };
}

export function convertToMentorDetails(mentor: Mentor): MentorDetails {
  const mentorBasic = convertToMentorBasic(mentor);
  const user = (mentor.user as User)!;
  return {
    ...mentorBasic,
    students: mentor.students ?? [],
    cityName: user.cityName ?? '',
    countryName: user.countryName ?? '',
    maxStudentsLimit: mentor.maxStudentsLimit,
    studentsPreference: mentor.studentsPreference ?? 'any',
    studentsCount: mentor.students ? mentor.students.length : 0,
    screenings: {
      total: mentor.stageInterviews ? mentor.stageInterviews.length : 0,
    },
  };
}

function mentorQuery() {
  return getRepository(Mentor).createQueryBuilder('mentor');
}

function studentQuery() {
  return getRepository(Student).createQueryBuilder('student');
}

export async function getCourses() {
  const records = await getRepository(Course)
    .createQueryBuilder('course')
    .leftJoinAndSelect('course.discordServer', 'discordServer')
    .where('course.completed = false')
    .getMany();
  return records;
}

export async function getCourse(id: number) {
  const records = await getRepository(Course)
    .createQueryBuilder('course')
    .leftJoinAndSelect('course.discordServer', 'discordServer')
    .where({ id })
    .getOne();
  return records;
}

export async function getMentorByUserId(courseId: number, userId: number): Promise<{ id: number } | null> {
  const record = await mentorQuery()
    .where('mentor."userId" = :userId', { userId })
    .andWhere('mentor."courseId" = :courseId', { courseId })
    .getOne();
  return record ?? null;
}

export async function expelMentor(courseId: number, githubId: string) {
  const mentor = await queryMentorByGithubId(courseId, githubId);
  if (mentor) {
    await getRepository(Student).update({ mentorId: mentor.id }, { mentorId: null });
    await getRepository(Mentor).update(mentor.id, { isExpelled: true });
    await getCustomRepository(StageInterviewRepository).cancelByMentor(courseId, githubId);
  }
}

export async function restoreMentor(courseId: number, githubId: string) {
  const mentor = await queryMentorByGithubId(courseId, githubId);
  if (mentor) {
    await getRepository(Mentor).update(mentor.id, { isExpelled: false });
  }
}

export async function getMentorByGithubId(courseId: number, githubId: string): Promise<MentorBasic | null> {
  const record = await mentorQuery()
    .innerJoin('mentor.user', 'user')
    .addSelect(getPrimaryUserFields())
    .where('user.githubId = :githubId', { githubId })
    .andWhere('mentor."courseId" = :courseId', { courseId })
    .getOne();
  if (record == null) {
    return null;
  }
  return convertToMentorBasic(record);
}

export async function getStudentByGithubId(courseId: number, githubId: string): Promise<Student | null> {
  const record = await studentQuery()
    .innerJoin('student.user', 'user')
    .where('user.githubId = :githubId', { githubId })
    .andWhere('student.courseId = :courseId', { courseId })
    .getOne();
  if (record == null) {
    return null;
  }
  return record;
}

export async function queryStudentById(
  courseId: number,
  id: number,
): Promise<{ id: number; name: string; githubId: string; userId: number } | null> {
  const record = await studentQuery()
    .innerJoin('student.user', 'user')
    .addSelect(['user.firstName', 'user.lastName', 'user.githubId', 'user.id'])
    .where('student.id = :id', { id })
    .andWhere('student.courseId = :courseId', { courseId })
    .getOne();

  if (record == null) {
    return null;
  }

  return { id: record.id, name: createName(record.user), githubId: record.user.githubId, userId: record.user.id };
}

export async function queryStudentByGithubId(
  courseId: number,
  githubId: string,
): Promise<{ id: number; name: string; githubId: string; userId: number } | null> {
  const record = await studentQuery()
    .innerJoin('student.user', 'user')
    .addSelect(['user.firstName', 'user.lastName', 'user.githubId', 'user.id'])
    .where('user.githubId = :githubId', { githubId })
    .andWhere('student.courseId = :courseId', { courseId })
    .getOne();
  if (record == null) {
    return null;
  }
  return { id: record.id, name: createName(record.user), githubId: record.user.githubId, userId: record.user.id };
}

export async function queryMentorByGithubId(
  courseId: number,
  githubId: string,
): Promise<{ id: number; name: string; githubId: string } | null> {
  const record = await mentorQuery()
    .innerJoin('mentor.user', 'user')
    .addSelect(['user.firstName', 'user.lastName', 'user.githubId'])
    .where('user.githubId = :githubId', { githubId })
    .andWhere('mentor.courseId = :courseId', { courseId })
    .getOne();
  if (record == null) {
    return null;
  }
  return { id: record.id, name: createName(record.user), githubId: record.user.githubId };
}

export async function queryMentorById(
  courseId: number,
  id: number,
): Promise<{ id: number; name: string; githubId: string } | null> {
  const record = await mentorQuery()
    .innerJoin('mentor.user', 'user')
    .addSelect(['user.firstName', 'user.lastName', 'user.githubId'])
    .where('mentor.id = :id', { id })
    .andWhere('mentor.courseId = :courseId', { courseId })
    .getOne();
  if (record == null) {
    return null;
  }
  return { id: record.id, name: createName(record.user), githubId: record.user.githubId };
}

export async function getCrossStudentsByMentor(courseId: number, githubId: string) {
  const records = await studentQuery()
    .innerJoin('student.user', 'user')
    .addSelect(getPrimaryUserFields())
    .innerJoinAndSelect('student.taskChecker', 'taskChecker')
    .innerJoinAndSelect('taskChecker.mentor', 'mentor')
    .innerJoin('mentor.user', 'mentorUser')
    .addSelect(getPrimaryUserFields('mentorUser'))
    .where('mentorUser.githubId = :githubId', { githubId })
    .andWhere('student.courseId = :courseId', { courseId })
    .andWhere('student.isExpelled = false')
    .getMany();

  const students = records
    .map<AssignedStudent[]>(record => {
      const student = convertToStudentBasic(record);
      student.mentor = record.mentor ? convertToMentorBasic(record.mentor) : null;
      const checkers: TaskChecker[] = record.taskChecker ?? [];
      return checkers.map(checker => ({ ...student, courseTaskId: checker?.courseTaskId })) ?? [];
    })
    .flat();

  return students;
}

export async function getMentors(courseId: number): Promise<MentorDetails[]> {
  const records = await mentorQuery()
    .innerJoin('mentor.user', 'user')
    .addSelect(getPrimaryUserFields())
    .innerJoin('mentor.course', 'course')
    .leftJoin('mentor.students', 'students')
    .addSelect(['students.id'])
    .leftJoinAndSelect('mentor.stageInterviews', 'stageInterviews')
    .where(`course.id = :courseId`, { courseId })
    .orderBy('mentor.createdDate')
    .getMany();

  const mentors = records.map(convertToMentorDetails);
  return mentors;
}

export async function getMentorsDetails(courseId: number): Promise<MentorDetails[]> {
  const mentorRepository = getCustomRepository(MentorRepository);
  const mentors = mentorRepository.findExtended(courseId);
  return mentors;
}

export async function getMentorsWithStudents(courseId: number): Promise<MentorDetails[]> {
  const records = await mentorQuery()
    .innerJoin('mentor.user', 'user')
    .addSelect(getPrimaryUserFields())
    .leftJoinAndSelect('mentor.students', 'students')
    .where(`mentor.courseId = :courseId`, { courseId })
    .andWhere('mentor.isExpelled = false')
    .orderBy('mentor.createdDate')
    .getMany();

  const mentors = records.map(convertToMentorDetails);
  return mentors;
}

export async function getMentorWithContacts(mentorId: number): Promise<MentorWithContacts> {
  const record = (await mentorQuery()
    .innerJoinAndSelect('mentor.user', 'user')
    .where('mentor.id = :mentorId', { mentorId })
    .getOne())!;
  const mentor = convertToMentorBasic(record);
  const user = record.user as User;
  const mentorWithContacts: MentorWithContacts = {
    ...mentor,
    contactsEmail: user.contactsEmail,
    contactsSkype: user.contactsSkype,
    contactsTelegram: user.contactsTelegram,
    contactsNotes: user.contactsNotes,
  };
  return mentorWithContacts;
}

export async function getStudentsWithDetails(courseId: number, activeOnly: boolean) {
  const records = await studentQuery()
    .innerJoin('student.user', 'user')
    .addSelect(getPrimaryUserFields())
    .innerJoin('student.course', 'course')
    .leftJoinAndSelect('student.mentor', 'mentor', 'mentor."isExpelled" = FALSE')
    .leftJoin('mentor.user', 'mentorUser')
    .leftJoin('student.stageInterviews', 'stageInterviews')
    .leftJoin('student.taskChecker', 'taskChecker')
    .leftJoin('taskChecker.courseTask', 'courseTask')
    .leftJoin('courseTask.task', 'task')
    .addSelect(getPrimaryUserFields('mentorUser'))
    .addSelect(['stageInterviews.id', 'stageInterviews.isCompleted'])
    .addSelect(['taskChecker.id', 'courseTask.id', 'task.id', 'task.name'])
    .where(`course.id = :courseId ${activeOnly ? 'AND student."isExpelled" = false' : ''}`, { courseId })
    .orderBy('student.totalScore', 'DESC')
    .getMany();

  const students = records.map(convertToStudentDetails);
  return students;
}

export async function getStudents(courseId: number, activeOnly: boolean) {
  const records = await studentQuery()
    .innerJoin('student.user', 'user')
    .addSelect(getPrimaryUserFields())
    .innerJoin('student.course', 'course')
    .leftJoinAndSelect('student.mentor', 'mentor')
    .leftJoin('mentor.user', 'mentorUser')
    .addSelect(getPrimaryUserFields('mentorUser'))
    .where(`course.id = :courseId ${activeOnly ? 'AND student."isExpelled" = false' : ''}`, { courseId })
    .orderBy('student.totalScore', 'DESC')
    .getMany();

  const students = records.map(convertToStudentDetails);
  return students;
}

export async function getStudentScore(studentId: number) {
  const student = await getRepository(Student)
    .createQueryBuilder('student')
    .leftJoinAndSelect('student.taskResults', 'taskResults')
    .leftJoin('taskResults.courseTask', 'courseTask')
    .addSelect(['courseTask.disabled', 'courseTask.id'])
    .leftJoinAndSelect('student.taskInterviewResults', 'taskInterviewResults')
    .leftJoin('student.stageInterviews', 'si')
    .leftJoin('si.stageInterviewFeedbacks', 'sif')
    .addSelect(['sif.stageInterviewId', 'sif.json', 'si.isCompleted', 'si.id', 'si.courseTaskId'])
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
  if (stageInterviews?.length && !results.find(tr => tr.courseTaskId === stageInterviews[0].courseTaskId)) {
    results.push({
      score: Math.floor((getStageInterviewRating(stageInterviews) ?? 0) * 10),
      courseTaskId: stageInterviews[0].courseTaskId,
    });
  }

  return {
    totalScore: student.totalScore ?? 0,
    rank: student.rank ?? 999999,
    results,
  };
}

export async function getCourseTask(taskId: number) {
  const courseTasks = await getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .innerJoinAndSelect('courseTask.task', 'task')
    .where('courseTask.id = :id', { id: taskId })
    .andWhere('courseTask.disabled = :disabled', { disabled: false })
    .getMany();
  return courseTasks;
}

export async function getCourseTasks(courseId: number) {
  const courseTasks = await getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .innerJoinAndSelect('courseTask.task', 'task')
    .where('courseTask.courseId = :courseId', { courseId })
    .andWhere('courseTask.disabled = :disabled', { disabled: false })
    .getMany();
  return courseTasks;
}

export async function getCourseTasksWithOwner(courseId: number) {
  const courseTasks = await getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .innerJoinAndSelect('courseTask.task', 'task')
    .leftJoin('courseTask.taskOwner', 'taskOwner')
    .addSelect(['taskOwner.githubId', 'taskOwner.id', 'taskOwner.firstName', 'taskOwner.lastName'])
    .where('courseTask.courseId = :courseId', { courseId })
    .andWhere('courseTask.disabled = :disabled', { disabled: false })
    .getMany();
  return courseTasks;
}

export async function updateScoreStudents(data: { id: number; totalScore: number }[]) {
  const chuncks = _.chunk(data, 500);

  // update score in chunks with delays.
  for (const chunck of chuncks) {
    await getRepository(Student).save(chunck);
    await timeout(10000);
  }
}

export function isPowerUser(courseId: number, session: IUserSession) {
  return isAdmin(session) || isManager(session, courseId) || isSupervisor(session, courseId);
}

export async function getEvent(eventId: number) {
  const answer = await getRepository(CourseEvent)
    .createQueryBuilder('courseEvent')
    .innerJoinAndSelect('courseEvent.event', 'event')
    .leftJoin('courseEvent.organizer', 'organizer')
    .addSelect(['organizer.id', 'organizer.firstName', 'organizer.lastName', 'organizer.githubId'])
    .where('courseEvent.id = :id', { id: eventId })
    .getOne();
  return answer;
}

export async function getEvents(courseId: number) {
  return getRepository(CourseEvent)
    .createQueryBuilder('courseEvent')
    .innerJoinAndSelect('courseEvent.event', 'event')
    .leftJoin('courseEvent.organizer', 'organizer')
    .addSelect(['organizer.id', 'organizer.firstName', 'organizer.lastName', 'organizer.githubId'])
    .where('courseEvent.courseId = :courseId', { courseId })
    .orderBy('courseEvent.dateTime')
    .getMany();
}

export async function getTaskSolutionsWithoutChecker(courseTaskId: number) {
  const records = await getRepository(TaskSolution)
    .createQueryBuilder('ts')
    .leftJoin('task_solution_checker', 'tsc', 'tsc."taskSolutionId" = ts.id')
    .where(`ts."courseTaskId" = :courseTaskId`, { courseTaskId })
    .andWhere('tsc.id IS NULL')
    .getMany();
  return records;
}

export async function getUsers(courseId: number) {
  const records = await getRepository(CourseUser)
    .createQueryBuilder('courseUser')
    .innerJoin('courseUser.user', 'user')
    .addSelect(getPrimaryUserFields())
    .where(`"courseUser"."courseId" = :courseId`, { courseId })
    .getMany();

  return records.map(r => ({
    courseId: r.courseId,
    id: r.userId,
    name: createName(r.user),
    githubId: r.user.githubId,
    isJuryActivist: r.isJuryActivist,
    isManager: r.isManager,
    isSupervisor: r.isSupervisor,
  }));
}

export async function getTaskSolutionCheckers(courseTaskId: number, minCheckedCount: number) {
  const query = getManager()
    .createQueryBuilder()
    .select(['ROUND(AVG("score")) as "score"', '"studentId" '])
    .from(qb => {
      // do sub query to select only top X scores
      const query = qb
        .from(TaskSolutionResult, 'tsr')
        .select([
          'tsr.studentId as "studentId"',
          'tsr.score as "score"',
          'row_number() OVER (PARTITION by tsr.studentId ORDER BY tsr.score desc) as "rownum"',
        ])
        .where(qb => {
          // query students who checked enough tasks
          const query = qb
            .subQuery()
            .select('r."checkerId"')
            .from(TaskSolutionChecker, 'c')
            .leftJoin(
              'task_solution_result',
              'r',
              ['r."checkerId" = c."checkerId"', 'r."studentId" = c."studentId"'].join(' AND '),
            )
            .where(`c."courseTaskId" = :courseTaskId`, { courseTaskId })
            .andWhere('r.id IS NOT NULL')
            .groupBy('r."checkerId"')
            .having(`COUNT(c.id) >= :count`, { count: minCheckedCount })
            .getQuery();
          return `"studentId" IN ${query}`;
        })
        .andWhere('tsr."courseTaskId" = :courseTaskId', { courseTaskId })
        .orderBy('tsr.studentId')
        .orderBy('tsr.score', 'DESC');
      return query;
    }, 's')
    .where('rownum <= :count', { count: minCheckedCount })
    .groupBy('"studentId"');

  const records = await query.getRawMany();

  return records.map(record => ({ studentId: record.studentId, score: Number(record.score) }));
}

export async function getInterviewStudentsByMentorId(courseTaskId: number, mentorId: number) {
  const records = await getRepository(Student)
    .createQueryBuilder('student')
    .innerJoin('student.user', 'user')
    .innerJoin('student.taskChecker', 'taskChecker')
    .addSelect(getPrimaryUserFields())
    .where('"taskChecker"."courseTaskId" = :courseTaskId', { courseTaskId })
    .andWhere('"taskChecker"."mentorId" = :mentorId', { mentorId })
    .getMany();

  const students = records.map(record => convertToStudentBasic(record));
  return students;
}

export type StudentCrossMentor = {
  name: string;
  mentor: {
    githubId: string;
    cityName?: string;
    contactsPhone?: string;
    contactsTelegram?: string;
    contactsSkype?: string;
    contactsNotes?: string;
    contactsEmail?: string;
  };
};

export async function getCrossMentorsByStudent(courseId: number, githubId: string): Promise<StudentCrossMentor[]> {
  const student = await getStudentByGithubId(courseId, githubId);

  if (student == null) {
    return [];
  }
  const taskCheckers = await getRepository(TaskChecker)
    .createQueryBuilder('taskChecker')
    .innerJoin('taskChecker.courseTask', 'courseTask')
    .innerJoin('courseTask.task', 'task')
    .innerJoin('taskChecker.mentor', 'mentor')
    .innerJoin('mentor.user', 'user')
    .addSelect([
      'courseTask.id',
      'courseTask.studentEndDate',
      'mentor.id',
      'task.id',
      'task.name',
      'user.primaryEmail',
      'user.contactsNotes',
      'user.contactsPhone',
      'user.contactsSkype',
      'user.contactsTelegram',
      ...getPrimaryUserFields('user'),
    ])
    .where('"taskChecker"."studentId" = :studentId', { studentId: student.id })
    .andWhere('task.type <> :type', { type: 'interview' })
    .getMany();

  if (taskCheckers.length === 0) {
    return [];
  }

  const students = taskCheckers.map(record => {
    const { githubId, primaryEmail, contactsNotes, contactsPhone, contactsSkype, contactsTelegram, cityName } =
      record.mentor.user;
    return {
      name: record.courseTask.task.name,
      mentor: {
        githubId,
        primaryEmail,
        contactsNotes,
        contactsPhone,
        contactsSkype,
        contactsTelegram,
        cityName: cityName ?? undefined,
      },
    };
  });
  return students;
}

function shiftDate(date: string, shift: number, format: string): string {
  return moment(date).add(shift, 'days').format(format);
}

function adjustEvent(event: any, startDateDaysDiff: number, courseId: number) {
  delete event.id;
  event.dateTime = shiftDate(event.dateTime, startDateDaysDiff, 'YYYY-MM-DD HH:mmZ');
  event.courseId = courseId;
}

function adjustTask(task: any, startDateDaysDiff: number, courseId: number) {
  delete task.id;
  task.studentStartDate = shiftDate(task.studentStartDate, startDateDaysDiff, 'YYYY-MM-DD HH:mmZ');
  task.studentEndDate = shiftDate(task.studentEndDate, startDateDaysDiff, 'YYYY-MM-DD HH:mmZ');
  if (task.mentorStartDate) {
    task.mentorStartDate = shiftDate(task.mentorStartDate, startDateDaysDiff, 'YYYY-MM-DD HH:mmZ');
  }
  if (task.mentorEndDate) {
    task.mentorEndDate = shiftDate(task.mentorEndDate, startDateDaysDiff, 'YYYY-MM-DD HH:mmZ');
  }
  task.courseId = courseId;
}

export async function createCourseFromCopy(courseId: number, details: any) {
  const courseToCopy = await getRepository(Course).findOne(courseId);

  if (courseToCopy && courseToCopy.id) {
    const events: any = await getEvents(courseId);
    const tasks: any = await getCourseTasks(courseId);
    const { id, ...couseWithoutId } = courseToCopy;
    const courseCopy: Course = { ...couseWithoutId, ...details };
    const courseData = await getRepository(Course).insert(courseCopy);

    const startDateDaysDiff = moment(details.startDate).diff(moment(courseToCopy.startDate), 'days');
    courseCopy.id = courseData.identifiers[0].id;

    events.forEach((e: CourseEvent) => adjustEvent(e, startDateDaysDiff, courseCopy.id));
    const savedEventsData = await getRepository(CourseEvent).insert(events);

    tasks.forEach((t: CourseTask) => adjustTask(t, startDateDaysDiff, courseCopy.id));
    const savedTasksData = await getRepository(CourseTask).insert(tasks);

    return { courseCopy, savedEventsData, savedTasksData };
  }

  throw new Error(`not valid course to copy id: ${courseId}`);
}

const timeout = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
