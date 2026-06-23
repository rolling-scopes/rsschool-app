import { getRepository } from 'typeorm';
import { TaskSolution, CourseTask, TaskSolutionResult, IUserSession } from '../models';
import { TaskSolutionComment, TaskSolutionReview } from '../models/taskSolution';
import { CrossCheckMessage, CrossCheckMessageAuthorRole } from '../models/taskSolutionResult';
import { getTaskSolution, getTaskSolutionResult, getTaskSolutionResultById } from './taskResults.service';
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
