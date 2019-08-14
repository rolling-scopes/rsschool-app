import { TaskResult, TaskArtefact } from '../models';
import { getRepository } from 'typeorm';

export async function getStudentTaskResult(studentId: number, courseTaskId: number) {
  return getRepository(TaskResult)
    .createQueryBuilder('taskResult')
    .innerJoinAndSelect('taskResult.student', 'student')
    .innerJoinAndSelect('taskResult.courseTask', 'courseTask')
    .where('student.id = :studentId AND courseTask.id = :courseTaskId', {
      studentId,
      courseTaskId,
    })
    .getOne();
}

export async function getStudentTaskArtefact(studentId: number, courseTaskId: number) {
  return getRepository(TaskArtefact)
    .createQueryBuilder('taskArtefact')
    .innerJoinAndSelect('taskArtefact.student', 'student')
    .innerJoinAndSelect('taskArtefact.courseTask', 'courseTask')
    .where('student.id = :studentId AND courseTask.id = :courseTaskId', {
      studentId,
      courseTaskId,
    })
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
    student: data.studentId,
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
    student: data.studentId,
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
