import { TaskResult, TaskArtefact, TaskSolution, TaskSolutionResult, TaskSolutionChecker } from '../models';
import { getRepository } from 'typeorm';
import { getPrimaryUserFields } from './course.service';

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

export async function getTaskSolutionFeedback(studentId: number, courseTaskId: number) {
  const comments = (await getRepository(TaskSolutionResult)
    .createQueryBuilder('tsr')
    .select(['tsr.comment'])
    .where('"tsr"."studentId" = :studentId', { studentId })
    .andWhere('"tsr"."courseTaskId" = :courseTaskId', { courseTaskId })
    .getMany()) as { comment: string }[];
  const taskSolution = await getRepository(TaskSolution)
    .createQueryBuilder('ts')
    .where('"ts"."studentId" = :studentId', { studentId })
    .andWhere('"ts"."courseTaskId" = :courseTaskId', { courseTaskId })
    .getOne();
  return { url: taskSolution?.url, comments };
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

export async function saveScore(
  studentId: number,
  courseTaskId: number,
  data: {
    authorId: number;
    score: number;
    comment: string;
    githubPrUrl?: string;
  },
) {
  const { authorId, githubPrUrl = null, comment = '' } = data;
  const score = Math.round(data.score);

  const existingResult = await getTaskResult(studentId, courseTaskId);
  if (existingResult == null) {
    const taskResult = createTaskResult(authorId, {
      comment,
      score,
      studentId,
      courseTaskId,
      githubPrUrl: githubPrUrl ?? undefined,
    });
    return getRepository(TaskResult).insert(taskResult);
  }

  if (
    existingResult.githubRepoUrl === githubPrUrl &&
    existingResult.comment === comment &&
    existingResult.score === score
  ) {
    return null;
  }

  if (githubPrUrl) {
    existingResult.githubPrUrl = githubPrUrl;
  }
  if (comment) {
    existingResult.comment = comment;
  }
  if (score !== existingResult.score) {
    existingResult.historicalScores.push({
      comment,
      authorId,
      score,
      dateTime: Date.now(),
    });
    existingResult.score = score;
  }

  return getRepository(TaskResult).update(existingResult.id, {
    score: existingResult.score,
    comment: existingResult.comment,
    githubPrUrl: existingResult.githubPrUrl,
    historicalScores: existingResult.historicalScores,
  });
}
