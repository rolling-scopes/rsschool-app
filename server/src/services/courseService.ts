import _ from 'lodash';
import { getRepository } from 'typeorm';
import { MentorBasic, StudentBasic } from '../../../common/models';
import {
  Course,
  CourseTask,
  Mentor,
  StageInterview,
  Student,
  User,
  CourseEvent,
  TaskSolution,
  CourseUser,
  TaskSolutionChecker,
  TaskSolutionResult,
  TaskChecker,
  TaskInterviewResult,
} from '../models';
import { IUserSession } from '../models/session';
import cities from './reference-data/cities.json';
import countries from './reference-data/countries.json';

const getPrimaryUserFields = (modelName = 'user') => [
  `${modelName}.id`,
  `${modelName}.firstName`,
  `${modelName}.lastName`,
  `${modelName}.githubId`,
  `${modelName}.locationName`,
];

const citiesMap = _.mapValues(_.keyBy(cities, 'name'), 'parentId');
const countriesMap = _.mapValues(_.keyBy(countries, 'id'), 'name');

function createName({ firstName, lastName }: { firstName: string; lastName: string }) {
  return `${firstName} ${lastName}`.trim();
}

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
  locationName: string | null;
  countryName: string;
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
  locationName: string;
  isActive: boolean;
  taskResults: { courseTaskId: number; score: number }[];
}

export interface MentorDetails extends MentorBasic {
  locationName: string | null;
  countryName: string;
  maxStudentsLimit: number;
  studentsPreference: 'sameCity' | 'sameCountry' | null;
  interviewsCount?: number;
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
    totalScore: student.totalScore,
  };
}

export function convertToStudentDetails(student: Student): StudentDetails {
  const studentBasic = convertToStudentBasic(student);
  const user = (student.user as User)!;
  const checks =
    student.taskChecker?.map(({ courseTask }) => ({
      id: courseTask.id,
      name: courseTask.task.name,
    })) ?? [];
  return {
    ...studentBasic,
    locationName: user.locationName || null,
    countryName: countriesMap[citiesMap[user.locationName!]] || 'Other',
    interviews: _.isEmpty(student.stageInterviews) ? [] : student.stageInterviews!,
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
    locationName: user.locationName || null,
    countryName: countriesMap[citiesMap[user.locationName!]] || 'Other',
    maxStudentsLimit: mentor.maxStudentsLimit,
    studentsPreference: mentor.studentsPreference,
    studentsCount: mentor.students ? mentor.students.length : 0,
    interviewsCount: mentor.stageInterviews ? mentor.stageInterviews.length : 0,
  };
}

function mentorQuery() {
  return getRepository(Mentor).createQueryBuilder('mentor');
}

function userQuery() {
  return getRepository(User).createQueryBuilder('user');
}

function studentQuery() {
  return getRepository(Student).createQueryBuilder('student');
}

export async function getCourses() {
  const records = await getRepository(Course)
    .createQueryBuilder('course')
    .where('course.completed = false')
    .getMany();
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
  const githubIdQuery = userQuery()
    .select('id')
    .where('user.githubId = :githubId', { githubId })
    .getQuery();

  return mentorQuery()
    .update(Mentor)
    .set({ isExpelled: true })
    .where(`userId IN (${githubIdQuery})`, { githubId })
    .andWhere('mentor."courseId" = :courseId', { courseId })
    .execute();
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

export async function getStudentByGithubId(courseId: number, githubId: string): Promise<{ id: number } | null> {
  const record = await queryStudentByGithubId(courseId, githubId);
  return record;
}

export async function queryStudentByGithubId(courseId: number, githubId: string): Promise<Student> {
  const record = (await studentQuery()
    .innerJoin('student.user', 'user')
    .where('user.githubId = :githubId', { githubId })
    .andWhere('student.courseId = :courseId', { courseId })
    .getOne())!;
  return record;
}

export async function getStudent(studentId: number): Promise<StudentBasic> {
  const record = (await studentQuery()
    .innerJoinAndSelect('student.user', 'user')
    .leftJoinAndSelect('student.mentor', 'mentor')
    .leftJoinAndSelect('mentor.user', 'mentorUser')
    .where('"student".id = :studentId', { studentId })
    .getOne())!;
  const student = convertToStudentBasic(record);
  student.mentor = record.mentor ? convertToMentorBasic(record.mentor) : null;
  return student;
}

export async function getStudentByUserId(courseId: number, userId: number): Promise<StudentBasic | null> {
  const record = await studentQuery()
    .innerJoinAndSelect('student.course', 'course')
    .innerJoinAndSelect('student.user', 'user')
    .innerJoinAndSelect('student.mentor', 'mentor')
    .innerJoinAndSelect('mentor.user', 'mentorUser')
    .where('user.id = :userId AND course.id = :courseId', {
      userId,
      courseId,
    })
    .getOne();
  if (record == null) {
    return null;
  }
  const student = convertToStudentBasic(record);
  student.mentor = record.mentor ? convertToMentorBasic(record.mentor) : null;
  return student;
}

export async function getStudentsByMentorId(mentorId: number) {
  const records = await studentQuery()
    .innerJoin('student.user', 'user')
    .addSelect(getPrimaryUserFields())
    .innerJoinAndSelect('student.mentor', 'mentor')
    .innerJoin('mentor.user', 'mentorUser')
    .addSelect(getPrimaryUserFields('mentorUser'))
    .where('"student"."mentorId" = :mentorId', { mentorId })
    .andWhere('"student"."isExpelled" = false')
    .getMany();

  const students = records.map(record => {
    const student = convertToStudentBasic(record);
    student.mentor = record.mentor ? convertToMentorBasic(record.mentor) : null;
    return student;
  });

  return students;
}

export async function getStageInterviewStudentsByMentorId(mentorId: number) {
  const records = await getRepository(StageInterview)
    .createQueryBuilder('stageInterview')
    .innerJoinAndSelect('stageInterview.mentor', 'mentor')
    .innerJoinAndSelect('stageInterview.student', 'student')
    .innerJoinAndSelect('student.user', 'studentUser')
    .where('stageInterview.mentorId = :mentorId', { mentorId })
    .getMany();

  const students = records.map(record => convertToStudentBasic(record.student));
  return students;
}

export async function getAssignedStudentsByMentorId(mentorId: number) {
  const records = await studentQuery()
    .innerJoin('student.user', 'user')
    .addSelect(getPrimaryUserFields())
    .innerJoinAndSelect('student.taskChecker', 'taskChecker')
    .innerJoinAndSelect('student.mentor', 'mentor')
    .innerJoin('mentor.user', 'mentorUser')
    .addSelect(getPrimaryUserFields('mentorUser'))
    .where('"taskChecker"."mentorId" = :mentorId', { mentorId })
    .andWhere('"student"."isExpelled" = false')
    .getMany();

  const students = records
    .map<AssignedStudent[]>(record => {
      const student = convertToStudentBasic(record);
      student.mentor = record.mentor ? convertToMentorBasic(record.mentor) : null;

      return (
        record.taskChecker?.map(taskChecker => ({
          ...student,
          courseTaskId: taskChecker ? taskChecker.courseTaskId : null,
        })) ?? []
      );
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
  const courseTaskQuery = getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .select(['courseTask.id'])
    .leftJoin('courseTask.task', 'task')
    .where('task.verification = :manual', { manual: 'manual' })
    .andWhere('"courseTask".checker = :mentor', { mentor: 'mentor' })
    .andWhere('"courseTask"."courseId" = :courseId', { courseId })
    .andWhere('"courseTask"."studentEndDate" < NOW()');

  const courseTasks = await courseTaskQuery.getMany();

  const query = mentorQuery()
    .innerJoin('mentor.user', 'user')
    .addSelect(getPrimaryUserFields())
    .leftJoin('mentor.students', 'students')
    .addSelect(['students.id', 'students.isExpelled', 'students.isFailed'])
    .leftJoin('students.taskResults', 'taskResults', `taskResults.courseTaskId IN (:...taskIds)`, {
      taskIds: courseTasks.length > 0 ? courseTasks.map(t => t.id) : [null],
    })
    .addSelect(['taskResults.id', 'taskResults.score', 'taskResults.courseTaskId', 'taskResults.updatedDate'])
    .where(`"mentor"."courseId" = :courseId`, { courseId })
    .orderBy('mentor.createdDate');

  const records = await query.getMany();

  const count = courseTasks.length;
  const mentors = records.map(mentor => {
    const mentorBasic = convertToMentorBasic(mentor);
    const user = (mentor.user as User)!;
    const activeStudents = mentor.students?.filter(s => !s.isExpelled && !s.isFailed) ?? [];
    const totalToCheck = activeStudents.length * count;
    const lastUpdatedDate = _.max(
      _.flatMap(mentor.students ?? [], s => s.taskResults?.map(r => new Date(r.updatedDate).getTime()) ?? []),
    );
    return {
      ...mentorBasic,
      locationName: user.locationName || null,
      countryName: countriesMap[citiesMap[user.locationName!]] || 'Other',
      maxStudentsLimit: mentor.maxStudentsLimit,
      studentsPreference: mentor.studentsPreference,
      studentsCount: activeStudents.length,
      interviewsCount: mentor.stageInterviews ? mentor.stageInterviews.length : 0,
      taskResultsStats: {
        lastUpdatedDate,
        total: totalToCheck,
        checked: activeStudents.reduce((acc, student) => acc + (student.taskResults?.length ?? 0), 0) ?? 0,
      },
    };
  });
  return mentors;
}

export async function getMentorsWithStudents(courseId: number): Promise<MentorDetails[]> {
  const records = await mentorQuery()
    .innerJoin('mentor.user', 'user')
    .addSelect(getPrimaryUserFields())
    .innerJoin('mentor.course', 'course')
    .leftJoinAndSelect('mentor.students', 'students')
    .where(`course.id = :courseId`, { courseId })
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

export async function getStudentsScore(courseId: number, activeOnly = false) {
  let query = getRepository(Student)
    .createQueryBuilder('student')
    .innerJoin('student.user', 'user')
    .addSelect(getPrimaryUserFields().concat(['user.locationName']))
    .leftJoin('student.mentor', 'mentor', 'mentor."isExpelled" = FALSE')
    .addSelect(['mentor.id', 'mentor.userId'])
    .leftJoin('student.taskResults', 'tr')
    .addSelect(['tr.id', 'tr.score', 'tr.courseTaskId', 'tr.studentId'])
    .leftJoin('student.taskInterviewResults', 'tir')
    .addSelect(['tir.id', 'tir.score', 'tir.courseTaskId', 'tr.studentId', 'tir.updatedDate'])
    .leftJoin('mentor.user', 'mu')
    .addSelect(getPrimaryUserFields('mu'))
    .where('student."courseId" = :courseId', { courseId });

  if (activeOnly) {
    query = query.andWhere('student."isFailed" = false').andWhere('student."isExpelled" = false');
  }
  const students = await query.orderBy('student."totalScore"', 'DESC').getMany();

  return students.map<StudentWithResults>((student, i) => {
    const user = student.user as User;
    const interviews = _.values(_.groupBy(student.taskInterviewResults ?? [], 'courseTaskId'))
      .map(arr => _.first(_.orderBy(arr, 'updatedDate', 'desc'))!)
      .map(({ courseTaskId, score = 0 }) => ({ courseTaskId, score }));
    const taskResults =
      student.taskResults?.map(({ courseTaskId, score }) => ({ courseTaskId, score })).concat(interviews) ?? [];

    const mentor = student.mentor ? convertToMentorBasic(student.mentor) : undefined;
    return {
      id: student.id,
      rank: i + 1,
      mentor: mentor ? { githubId: mentor.githubId, name: mentor.name } : undefined,
      name: createName(user),
      githubId: user.githubId,
      totalScore: student.totalScore,
      totalScoreChangeDate: student.totalScoreChangeDate,
      locationName: user.locationName ?? '',
      taskResults,
      isActive: !student.isExpelled && !student.isFailed,
    };
  });
}

export async function getStudentScore(studentId: number) {
  const student = await getRepository(Student)
    .createQueryBuilder('student')
    .leftJoinAndSelect('student.taskResults', 'taskResults')
    .leftJoinAndSelect('student.taskInterviewResults', 'taskInterviewResults')
    .where('student.id = :studentId', { studentId })
    .getOne();

  const taskResults = student?.taskResults?.map(({ courseTaskId, score }) => ({ courseTaskId, score })) ?? [];
  const interviewResults =
    student?.taskInterviewResults?.map(({ courseTaskId, score = 0 }) => ({
      courseTaskId,
      score,
    })) ?? [];

  const results = taskResults.concat(interviewResults);

  return {
    totalScore: student?.totalScore ?? 0,
    results,
  };
}

export async function getCourseTasks(courseId: number) {
  const courseTasks = await getRepository(CourseTask)
    .createQueryBuilder('courseTask')
    .innerJoinAndSelect('courseTask.task', 'task')
    .innerJoin('courseTask.stage', 'stage')
    .where('stage.courseId = :courseId', { courseId })
    .getMany();
  return courseTasks;
}

export async function updateScoreStudents(data: { id: number; totalScore: number }[]) {
  const result = await getRepository(Student).save(data);
  return result;
}

export function isPowerUser(courseId: number, session: IUserSession) {
  return (
    session.isAdmin ||
    session.coursesRoles?.[courseId]?.includes('manager') ||
    session.coursesRoles?.[courseId]?.includes('supervisor')
  );
}

export async function getEvents(courseId: number) {
  return getRepository(CourseEvent)
    .createQueryBuilder('courseEvent')
    .innerJoinAndSelect('courseEvent.event', 'event')
    .innerJoin('courseEvent.stage', 'stage')
    .leftJoin('courseEvent.organizer', 'organizer')
    .addSelect([
      'stage.id',
      'stage.name',
      'organizer.id',
      'organizer.firstName',
      'organizer.lastName',
      'organizer.githubId',
    ])
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
  const records = await getRepository(TaskSolutionResult)
    .createQueryBuilder('tsr')
    .select('tsr."studentId", ROUND(AVG(tsr.score)) as "score"')
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
    .groupBy('tsr."studentId"')
    .having(`COUNT(tsr.id) >= :count`, { count: minCheckedCount - 1 })
    .getRawMany();

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

export type StudentInterview = {
  name: string;
  endDate: string | null;
  completed: boolean;
  interviewer: {
    githubId: string;
    locationName?: string;
    contactsPhone?: string;
    contactsTelegram?: string;
    contactsSkype?: string;
    contactsNotes?: string;
    contactsEmail?: string;
  };
};

export type StudentCrossMentor = {
  name: string;
  mentor: {
    githubId: string;
    locationName?: string;
    contactsPhone?: string;
    contactsTelegram?: string;
    contactsSkype?: string;
    contactsNotes?: string;
    contactsEmail?: string;
  };
};

export async function getInterviewsByStudent(courseId: number, githubId: string): Promise<StudentInterview[]> {
  const student = await getStudentByGithubId(courseId, githubId);

  if (student == null) {
    return [];
  }
  const interviews = await getRepository(TaskChecker)
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
      'user.githubId',
      'user.id',
      'user.locationName',
    ])
    .where('"taskChecker"."studentId" = :studentId', { studentId: student.id })
    .andWhere('task.type = :type', { type: 'interview' })
    .getMany();

  if (interviews.length === 0) {
    return [];
  }

  const taskResults = await getRepository(TaskInterviewResult)
    .createQueryBuilder('taskInterviewResult')
    .where('"taskInterviewResult"."courseTaskId" IN (:...ids)', { ids: interviews.map(i => i.courseTaskId) })
    .getMany();

  const students = interviews.map(record => {
    const {
      githubId,
      primaryEmail,
      contactsNotes,
      contactsPhone,
      contactsSkype,
      contactsTelegram,
      locationName,
    } = record.mentor.user;
    return {
      name: record.courseTask.task.name,
      endDate: record.courseTask.studentEndDate,
      completed: taskResults.some(taskResult => taskResult.courseTaskId === record.courseTaskId),
      interviewer: {
        githubId,
        primaryEmail,
        contactsNotes,
        contactsPhone,
        contactsSkype,
        contactsTelegram,
        locationName,
      },
    };
  });
  return students;
}

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
      'user.githubId',
      'user.id',
      'user.locationName',
    ])
    .where('"taskChecker"."studentId" = :studentId', { studentId: student.id })
    .andWhere('task.type <> :type', { type: 'interview' })
    .getMany();

  if (taskCheckers.length === 0) {
    return [];
  }

  const students = taskCheckers.map(record => {
    const {
      githubId,
      primaryEmail,
      contactsNotes,
      contactsPhone,
      contactsSkype,
      contactsTelegram,
      locationName,
    } = record.mentor.user;
    return {
      name: record.courseTask.task.name,
      mentor: {
        githubId,
        primaryEmail,
        contactsNotes,
        contactsPhone,
        contactsSkype,
        contactsTelegram,
        locationName,
      },
    };
  });
  return students;
}
