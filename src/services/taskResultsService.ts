import { TaskResult } from '../models';
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

type TaskResultInput = {
  studentId: number;
  courseTaskId: number;
  score: number;
  comment: string;
  githubPrUrl: string;
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
