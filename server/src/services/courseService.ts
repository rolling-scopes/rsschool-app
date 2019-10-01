import _ from 'lodash';
import { getRepository } from 'typeorm';
import { MentorBasic, StudentBasic } from '../../../common/models';
import { Course, CourseTask, Mentor, Student, User, CourseEvent } from '../models';
import { IUserSession } from '../models/session';
import cities from './reference-data/cities.json';
import countries from './reference-data/countries.json';

const primaryUserFields = ['user.id', 'user.firstName', 'user.lastName', 'user.githubId', 'user.locationName'];

const citiesMap = _.mapValues(_.keyBy(cities, 'name'), 'parentId');
const countriesMap = _.mapValues(_.keyBy(countries, 'id'), 'name');

export async function getCourseMentorWithUser(courseId: number, userId: number) {
  return await getRepository(Mentor)
    .createQueryBuilder('mentor')
    .innerJoinAndSelect('mentor.user', 'user')
    .where('mentor."courseId" = :courseId AND mentor.user.id = :id', { id: userId, courseId })
    .getOne();
}

export interface MentorWithContacts extends MentorBasic {
  email?: string;
  phone?: string;
}

export interface AssignedStudent extends StudentBasic {
  courseTaskId: number | null;
}

export interface StudentDetails extends StudentBasic {
  locationName: string | null;
  countryName: string;
}

export interface StudentWithResults extends StudentBasic {
  rank: number;
  locationName: string;
  taskResults: {
    courseTaskId: number;
    score: number;
  }[];
}

export interface MentorDetails extends MentorBasic {
  locationName: string | null;
  countryName: string;
}

export function convertToMentorBasic(mentor: Mentor): MentorBasic {
  const user = (mentor.user as User)!;
  return {
    lastName: user.lastName,
    firstName: user.firstName,
    id: mentor.id,
    githubId: user.githubId,
    userId: user.id!,
    courseId: mentor.courseId,
    students: [],
  };
}

export function convertToStudentBasic(student: Student): StudentBasic {
  const user = (student.user as User)!;
  return {
    lastName: user.lastName,
    firstName: user.firstName,
    isActive: !student.isExpelled && !student.isFailed,
    id: student.id,
    githubId: user.githubId,
    userId: user.id!,
    courseId: student.courseId,
    mentor: null,
    totalScore: student.totalScore,
  };
}

export function convertToStudentDetails(student: Student): StudentDetails {
  const studentBasic = convertToStudentBasic(student);
  const user = (student.user as User)!;
  return {
    ...studentBasic,
    locationName: user.locationName || null,
    countryName: countriesMap[citiesMap[user.locationName!]] || 'Other',
  };
}

export function convertToMentorDetails(mentor: Mentor): MentorDetails {
  const mentorBasic = convertToMentorBasic(mentor);
  const user = (mentor.user as User)!;
  return {
    ...mentorBasic,
    locationName: user.locationName || null,
    countryName: countriesMap[citiesMap[user.locationName!]] || 'Other',
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
    .where('course.completed = false')
    .getMany();
  return records;
}

export async function getMentor(mentorId: number): Promise<MentorBasic> {
  const record = (await mentorQuery()
    .innerJoinAndSelect('mentor.user', 'user')
    .where('"mentor".id = :mentorId', { mentorId })
    .getOne())!;
  return convertToMentorBasic(record);
}

export async function getMentorByUserId(courseId: number, userId: number): Promise<MentorBasic | null> {
  const record = await mentorQuery()
    .innerJoin('mentor.user', 'user')
    .addSelect(primaryUserFields)
    .innerJoinAndSelect('mentor.course', 'course')
    .where('user.id = :userId AND course.id = :courseId', {
      userId,
      courseId,
    })
    .getOne();
  if (record == null) {
    return null;
  }
  return convertToMentorBasic(record);
}

export async function getMentorByGithubId(courseId: number, githubId: string): Promise<MentorBasic> {
  const record = (await mentorQuery()
    .innerJoin('mentor.user', 'user')
    .addSelect(primaryUserFields)
    .innerJoin('mentor.course', 'course')
    .where('user.githubId = :githubId AND course.id = :courseId', {
      githubId,
      courseId,
    })
    .getOne())!;
  return convertToMentorBasic(record);
}

export async function getStudent(studentId: number): Promise<StudentBasic> {
  const record = (await studentQuery()
    .innerJoinAndSelect('student.user', 'user')
    .innerJoinAndSelect('student.mentor', 'mentor')
    .innerJoinAndSelect('mentor.user', 'mentorUser')
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
    .addSelect(primaryUserFields)
    .innerJoinAndSelect('student.mentor', 'mentor')
    .innerJoinAndSelect('mentor.user', 'mentorUser')
    .where('"student"."mentorId" = :mentorId', { mentorId })
    .getMany();

  const students = records.map(record => {
    const student = convertToStudentBasic(record);
    student.mentor = record.mentor ? convertToMentorBasic(record.mentor) : null;
    return student;
  });

  return students;
}

export async function getAssignedStudentsByMentorId(mentorId: number) {
  const records = await studentQuery()
    .innerJoin('student.user', 'user')
    .addSelect(primaryUserFields)
    .innerJoinAndSelect('student.taskChecker', 'taskChecker')
    .innerJoinAndSelect('student.mentor', 'mentor')
    .innerJoinAndSelect('mentor.user', 'mentorUser')
    .where('"taskChecker"."mentorId" = :mentorId', { mentorId })
    .getMany();

  const students = records.map<AssignedStudent>(record => {
    const student = convertToStudentBasic(record);
    student.mentor = record.mentor ? convertToMentorBasic(record.mentor) : null;

    const [taskChecker] = record.taskChecker || [null];
    return {
      ...student,
      courseTaskId: taskChecker ? taskChecker.courseTaskId : null,
    };
  });

  return students;
}

export async function getMentors(courseId: number): Promise<MentorDetails[]> {
  const records = await mentorQuery()
    .innerJoin('mentor.user', 'user')
    .addSelect(primaryUserFields)
    .innerJoin('mentor.course', 'course')
    .where(`course.id = :courseId`, { courseId })
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
  const mentorWithContacts: MentorWithContacts = {
    ...mentor,
    email: (record.user as User).contactsEmail,
    phone: (record.user as User).contactsPhone,
  };
  return mentorWithContacts;
}

export async function getStudents(courseId: number, activeOnly: boolean) {
  const records = await studentQuery()
    .innerJoin('student.user', 'user')
    .addSelect(primaryUserFields)
    .innerJoin('student.course', 'course')
    .where(`course.id = :courseId ${activeOnly ? 'AND student."isExpelled" = false' : ''}`, { courseId })
    .getMany();

  const students = records.map(convertToStudentDetails);
  return students;
}

export async function getScoreStudents(courseId: number) {
  const students = await getRepository(Student)
    .createQueryBuilder('student')
    .innerJoin('student.user', 'user')
    .addSelect(primaryUserFields.concat(['user.locationName']))
    .leftJoinAndSelect('student.mentor', 'mentor')
    .leftJoinAndSelect('student.taskResults', 'taskResults')
    .leftJoinAndSelect('student.taskInterviewResults', 'taskInterviewResults')
    .leftJoinAndSelect('mentor.user', 'mentorUser')
    .innerJoin('student.course', 'course')
    .where('course.id = :courseId', { courseId })
    .getMany();

  return students
    .sort((a, b) => b.totalScore - a.totalScore)
    .map<StudentWithResults>((student, i) => {
      const user = student.user as User;
      return {
        rank: i + 1,
        courseId,
        id: student.id,
        mentor: student.mentor ? convertToMentorBasic(student.mentor) : null,
        userId: user.id!,
        firstName: user.firstName,
        lastName: user.lastName,
        githubId: user.githubId,
        totalScore: student.totalScore,
        locationName: user.locationName || '',
        taskResults: (student.taskResults || [])
          .map(taskResult => ({
            courseTaskId: taskResult.courseTaskId,
            score: taskResult.score,
          }))
          .concat(
            (student.taskInterviewResults || []).map(interviewResult => ({
              courseTaskId: interviewResult.courseTaskId,
              score: interviewResult.score || 0,
            })),
          ),
        isActive: !student.isExpelled && !student.isFailed,
      };
    });
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
  return session.isAdmin || session.roles[courseId] === 'coursemanager';
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
    .orderBy('courseEvent.date')
    .getMany();
}
