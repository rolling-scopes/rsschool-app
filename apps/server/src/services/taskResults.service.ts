import {
  TaskResult,
  TaskArtefact,
  TaskSolution,
  TaskSolutionResult,
  TaskSolutionChecker,
  CourseTask,
  Student,
  User,
} from '../models';
import { getRepository } from 'typeorm';
import { getPrimaryUserFields } from './course.service';
import { createName } from './user.service';
import { CrossCheckMessageAuthorRole } from '../models/taskSolutionResult';

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

export async function getTaskSolutionResultById(id: number) {
  return getRepository(TaskSolutionResult)
    .createQueryBuilder('taskSolutionResult')
    .where('"taskSolutionResult"."id" = :id', { id })
    .getOne();
}

export async function getCrossCheckData(
  filter: {
    checkerStudent?: string;
    student?: string;
    task?: string;
    url?: string;
    score?: string;
  },
  pagination: { current: number; pageSize: number },
  courseId: number,
  orderBy: string,
  orderDirection?: 'ASC' | 'DESC' | undefined,
) {
  const orderByFieldMapping: Record<string, string> = {
    'checkerStudent,githubId': '"checkerStudent"."githubId"',
    'student,githubId': '"student"."githubId"',
    'task,name': '"task"."name"',
    url: 'taskSolution.url',
    score: 'tsr.score',
    reviewedDate: 'tsr.updatedDate',
    submittedDate: 'taskSolution.updatedDate',
  };

  const query = getRepository(TaskSolutionResult)
    .createQueryBuilder('tsr')
    .addSelect(['tsr.score', 'tsr.comment', 'tsr.updatedDate'])
    .leftJoin(CourseTask, 'courseTask', '"tsr"."courseTaskId" = "courseTask"."id"')
    .addSelect(['courseTask.id', 'courseTask.courseId'])
    .leftJoin('courseTask.task', 'task')
    .addSelect(['task.id', 'task.name'])
    .leftJoin(Student, 'st', '"tsr"."studentId" = "st"."id"')
    .leftJoin(User, 'student', '"st"."userId" = "student"."id"')
    .addSelect(['student.id', 'student.githubId'])
    .leftJoin(Student, 'ch', '"tsr"."checkerId" = "ch"."id"')
    .leftJoin(User, 'checkerStudent', '"ch"."userId" = "checkerStudent"."id"')
    .addSelect(['checkerStudent.id', 'checkerStudent.githubId'])
    .leftJoin(
      TaskSolution,
      'taskSolution',
      '"taskSolution"."courseTaskId" = "courseTask"."id" AND "taskSolution"."studentId" = "st"."id"',
    )
    .addSelect(['taskSolution.url', 'taskSolution.updatedDate'])
    .where(`courseTask.courseId = :courseId`, { courseId })
    .andWhere('courseTask.checker = :checker', { checker: 'crossCheck' });

  if (filter.checkerStudent) {
    query.andWhere('"checkerStudent"."githubId" ILIKE :checkerStudent', {
      checkerStudent: `%${filter.checkerStudent}%`,
    });
  }

  if (filter.student) {
    query.andWhere('"student"."githubId" ILIKE :student', {
      student: `%${filter.student}%`,
    });
  }

  if (filter.task) {
    query.andWhere('"task"."name" ILIKE :task', {
      task: `%${filter.task}%`,
    });
  }

  if (filter.url) {
    query.andWhere('"taskSolution"."url" ILIKE :url', {
      url: `%${filter.url}%`,
    });
  }

  const total = await query.getCount();

  const courseTasks = await query
    .orderBy(orderByFieldMapping[orderBy], orderDirection)
    .limit(pagination.pageSize)
    .offset((pagination.current - 1) * pagination.pageSize)
    .getRawMany();

  const result = courseTasks.map((e: any) => ({
    checkerStudent: {
      githubId: e.checkerStudent_githubId,
      id: e.checkerStudent_id,
    },
    courseTask: {
      courseId: e.courseTask_courseId,
      id: e.courseTask_id,
    },
    student: {
      githubId: e.student_githubId,
      id: e.student_id,
    },
    task: {
      name: e.task_name,
      id: e.task_id,
    },
    url: e.taskSolution_url,
    score: e.tsr_score,
    comment: e.tsr_comment,
    submittedDate: e.taskSolution_updatedDate,
    reviewedDate: e.tsr_updatedDate,
    key: `${e.checkerStudent_id}${e.courseTask_id}${e.student_id}${e.task_id}`,
  }));

  return {
    content: result,
    pagination: {
      current: pagination.current,
      pageSize: pagination.pageSize,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
    },
  };
}

export async function getTaskSolutionFeedback(studentId: number, courseTaskId: number) {
  const comments = (
    await getRepository(TaskSolutionResult)
      .createQueryBuilder('tsr')
      .select(['tsr.id', 'tsr.comment', 'tsr.anonymous', 'tsr.score', 'tsr.messages', 'tsr.historicalScores'])
      .innerJoin('tsr.checker', 'checker')
      .innerJoin('checker.user', 'user')
      .addSelect(['checker.id', ...getPrimaryUserFields('user')])
      .where('"tsr"."studentId" = :studentId', { studentId })
      .andWhere('"tsr"."courseTaskId" = :courseTaskId', { courseTaskId })
      .getMany()
  ).map(c => {
    const author = !c.anonymous
      ? {
          id: c.checker.user.id,
          name: createName(c.checker.user),
          githubId: c.checker.user.githubId,
          discord: c.checker.user.discord,
        }
      : null;
    const [{ dateTime, criteria }] = c.historicalScores.sort((a, b) => b.dateTime - a.dateTime);
    const messages = !c.anonymous
      ? c.messages
      : c.messages.map(message => ({
          ...message,
          author: message.role === CrossCheckMessageAuthorRole.Reviewer ? null : message.author,
        }));
    return {
      dateTime,
      author,
      messages,
      id: c.id,
      comment: c.comment,
      score: c.score,
      criteria,
    };
  });
  const taskSolution = await getRepository(TaskSolution)
    .createQueryBuilder('ts')
    .where('"ts"."studentId" = :studentId', { studentId })
    .andWhere('"ts"."courseTaskId" = :courseTaskId', { courseTaskId })
    .getOne();
  return { url: taskSolution?.url, reviews: comments };
}

type TaskArtefactInput = {
  studentId: number;
  courseTaskId: number;
  comment: string;
  videoUrl?: string;
  presentationUrl?: string;
};

export function createStudentArtefactTaskResult(data: TaskArtefactInput): Partial<TaskArtefact> {
  return {
    courseTaskId: data.courseTaskId,
    studentId: data.studentId,
    videoUrl: data.videoUrl,
    presentationUrl: data.presentationUrl,
  };
}
