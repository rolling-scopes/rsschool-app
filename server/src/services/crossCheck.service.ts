import { getRepository } from 'typeorm';
import { TaskSolution, CourseTask, TaskSolutionResult, IUserSession } from '../models';
import { TaskSolutionComment, TaskSolutionReview } from '../models/taskSolution';
import { CrossCheckMessage, CrossCheckMessageAuthorRole } from '../models/taskSolutionResult';
import { getTaskSolution, getTaskSolutionResult, getTaskSolutionResultById } from './taskResults.service';
import { getCourseTask } from './tasks.service';
import { queryStudentByGithubId } from './course.service';
import { CrossCheckCriteriaData } from '../models/taskSolutionResult';

export interface CrossCheckSolution {
  url: string;
  review?: TaskSolutionReview[];
  comments: TaskSolutionComment[];
}

export interface CrossCheckReviewResult extends CrossCheckSubmitResult {
  id: number;
  checkerId: number;
  studentId: number;
}

export interface CrossCheckSubmitResult {
  score: number;
  anonymous?: boolean;
  comment: string;
  review?: TaskSolutionReview[];
}

export class CrossCheckService {
  constructor(private courseTaskId: number) {}

  public static isCrossCheckTask(courseTask: Partial<CourseTask>) {
    return courseTask.checker === 'crossCheck';
  }

  public static isValidTaskSolution(data: Partial<TaskSolution>) {
    if (!data.url) {
      return false;
    }
    if (data.comments && !Array.isArray(data.comments)) {
      return false;
    }
    if (data.review && !Array.isArray(data.review)) {
      return false;
    }
    return true;
  }

  public async getStudentAndTask(courseId: number, githubId: string) {
    const [student, courseTask] = await Promise.all([
      queryStudentByGithubId(courseId, githubId),
      getCourseTask(this.courseTaskId),
    ]);
    return { student, courseTask };
  }

  public async saveSolution(studentId: number, data: Partial<TaskSolution>) {
    const existingResult = await getTaskSolution(studentId, this.courseTaskId);
    if (existingResult != null) {
      await getRepository(TaskSolution).save({
        ...existingResult,
        ...data,
        comments: existingResult.comments.concat(data.comments ?? []),
      });
      return;
    }

    await getRepository(TaskSolution).save({
      studentId,
      courseTaskId: this.courseTaskId,
      url: data.url,
      review: data.review,
      comments: data.comments,
    });
  }

  public async deleteSolution(studentId: number) {
    await getRepository(TaskSolution).delete({ studentId, courseTaskId: this.courseTaskId });
  }

  public async saveSolutionComments(
    studentId: number,
    courseTaskId: number,
    data: {
      comments: TaskSolutionComment[];
      authorId: number;
      authorGithubId: string;
      recipientId?: number;
    },
  ) {
    const taskSolution = await getTaskSolution(studentId, courseTaskId);
    if (taskSolution == null) {
      throw new Error(`Cross check solution not found StudentId=[${studentId} CourseTask=[${courseTaskId}]`);
    }
    const comments = data.comments.reduce((acc, comment) => {
      if (acc.some(c => c.criteriaId === comment.criteriaId && c.timestamp === comment.timestamp)) {
        return acc;
      }
      return acc.concat([{ ...comment, authorId: data.authorId, recipientId: data.recipientId }]);
    }, taskSolution.comments);

    await getRepository(TaskSolution).save({ id: taskSolution.id, comments });
  }

  public async saveResult(
    studentId: number,
    checkerId: number,
    data: CrossCheckSubmitResult,
    params: { userId: number; criteria: CrossCheckCriteriaData[] },
  ) {
    const { userId } = params;
    const historicalResult = { ...data, criteria: params.criteria, authorId: userId, dateTime: Date.now() };

    const repository = getRepository(TaskSolutionResult);
    const existing = await getTaskSolutionResult(studentId, checkerId, this.courseTaskId);

    if (existing != null) {
      const { historicalScores } = existing;
      const previousScore = { ...existing };
      historicalScores.push(historicalResult);
      await repository.update(existing.id, { ...data, historicalScores });
      if (previousScore.comment !== data.comment || previousScore.score !== data.score) {
        return previousScore;
      }
    } else {
      await repository.insert({
        studentId: studentId,
        checkerId: checkerId,
        courseTaskId: this.courseTaskId,
        historicalScores: [historicalResult],
        messages: [],
        ...data,
      });
    }
  }

  public async saveMessage(
    taskSolutionResultId: number,
    data: { content: string; role: CrossCheckMessageAuthorRole },
    params: { user: IUserSession },
  ) {
    const { user } = params;

    const message: CrossCheckMessage = {
      ...data,
      timestamp: new Date().toISOString(),
      author: {
        id: user.id,
        githubId: user.githubId,
      },
      isReviewerRead: data.role === CrossCheckMessageAuthorRole.Reviewer,
      isStudentRead: data.role === CrossCheckMessageAuthorRole.Student,
    };

    const repository = getRepository(TaskSolutionResult);
    const taskSolutionResultById = await getTaskSolutionResultById(taskSolutionResultId);

    if (taskSolutionResultById) {
      const { messages } = taskSolutionResultById;

      messages.push(message);
      await repository.update(taskSolutionResultById.id, { messages });
    }
  }

  public async updateMessage(taskSolutionResultId: number, data: { role: CrossCheckMessageAuthorRole }) {
    const { role } = data;

    const repository = getRepository(TaskSolutionResult);
    const taskSolutionResultById = await getTaskSolutionResultById(taskSolutionResultId);

    if (taskSolutionResultById) {
      const { messages } = taskSolutionResultById;

      const updatedMessages = messages.map(message => ({
        ...message,
        isReviewerRead: CrossCheckMessageAuthorRole.Reviewer === role ? true : message.isReviewerRead,
        isStudentRead: CrossCheckMessageAuthorRole.Student === role ? true : message.isStudentRead,
      }));

      await repository.update(taskSolutionResultById.id, { messages: updatedMessages });
    }
  }
}
