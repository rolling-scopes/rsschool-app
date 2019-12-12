import { TaskResult, TaskArtefact, TaskSolution, TaskSolutionResult, TaskSolutionChecker } from '../models';
import { getRepository } from 'typeorm';

const getPrimaryUserFields = (modelName: string = 'user') => [
  `${modelName}.id`,
  `${modelName}.firstName`,
  `${modelName}.lastName`,
  `${modelName}.githubId`,
  `${modelName}.locationName`,
];

export async function getTaskResult(studentId: number, courseTaskId: number) {
  return getRepository(TaskResult)
    .createQueryBuilder('taskResult')
    .where('"taskResult"."studentId" = :studentId', { studentId })
    .andWhere('"taskResult"."courseTaskId" = :courseTaskId', { courseTaskId })
    .getOne();
}

export async function getStudentTaskArtefact(studentId: number, courseTaskId: number) {
  return getRepository(TaskArtefact)
    .createQueryBuilder('taskArtefact')
    .where('"taskResult"."studentId" = :studentId', { studentId })
    .andWhere('"taskResult"."courseTaskId" = :courseTaskId', { courseTaskId })
    .getOne();
}

export async function getTaskSolution(studentId: number, courseTaskId: number) {
  return getRepository(TaskSolution)
    .createQueryBuilder('taskSolution')
    .where('"taskSolution"."studentId" = :studentId', { studentId })
    .andWhere('"taskSolution"."courseTaskId" = :courseTaskId', { courseTaskId })
    .getOne();
}

export async function getTaskSolutionChecker(studentId: number, checkerId: number, courseTaskId: number) {
  return getRepository(TaskSolutionChecker)
    .createQueryBuilder('taskSolutionChecker')
    .where('"taskSolutionChecker"."studentId" = :studentId', { studentId })
    .andWhere('"taskSolutionChecker"."checkerId" = :checkerId', { checkerId })
    .andWhere('"taskSolutionChecker"."courseTaskId" = :courseTaskId', { courseTaskId })
    .getOne();
}

export async function getTaskSolutionAssignments(checkerId: number, courseTaskId: number) {
  return getRepository(TaskSolutionChecker)
    .createQueryBuilder('taskSolutionChecker')
    .innerJoinAndSelect('taskSolutionChecker.taskSolution', 'taskSolution')
    .innerJoinAndSelect('taskSolutionChecker.student', 'student')
    .innerJoin('student.user', 'user')
    .addSelect(getPrimaryUserFields())
    .where('"taskSolutionChecker"."checkerId" = :checkerId', { checkerId })
    .andWhere('"taskSolutionChecker"."courseTaskId" = :courseTaskId', { courseTaskId })
    .getMany();
}

export async function getTaskSolutionResult(studentId: number, checkerId: number, courseTaskId: number) {
  return getRepository(TaskSolutionResult)
    .createQueryBuilder('taskSolutionResult')
    .where('"taskSolutionResult"."studentId" = :studentId', { studentId })
    .andWhere('"taskSolutionResult"."checkerId" = :checkerId', { checkerId })
    .andWhere('"taskSolutionResult"."courseTaskId" = :courseTaskId', { courseTaskId })
    .getOne();
}

type TaskResultInput = {
  studentId: number;
  courseTaskId: number;
  score: number;
  comment: string;
  githubPrUrl?: string;
};

type TaskArtefactInput = {
  studentId: number;
  courseTaskId: number;
  comment: string;
  videoUrl?: string;
  presentationUrl?: string;
};

export function createTaskResult(authorId: number, data: TaskResultInput): Partial<TaskResult> {
  return {
    comment: data.comment,
    courseTaskId: data.courseTaskId,
    studentId: data.studentId,
    score: data.score,
    historicalScores: [
      {
        authorId,
        score: data.score,
        dateTime: Date.now(),
        comment: data.comment,
      },
    ],
    githubPrUrl: data.githubPrUrl,
  };
}

export function createJuryTaskResult(authorId: number, data: TaskResultInput): Partial<TaskResult> {
  return {
    courseTaskId: data.courseTaskId,
    studentId: data.studentId,
    score: data.score,
    juryScores: [
      {
        authorId,
        score: data.score,
        dateTime: Date.now(),
        comment: data.comment,
      },
    ],
  };
}

export function createStudentArtefactTaskResult(data: TaskArtefactInput): Partial<TaskArtefact> {
  return {
    courseTaskId: data.courseTaskId,
    studentId: data.studentId,
    videoUrl: data.videoUrl,
    presentationUrl: data.presentationUrl,
  };
}
