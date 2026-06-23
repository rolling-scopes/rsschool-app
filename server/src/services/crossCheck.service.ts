import { getRepository } from 'typeorm';
import { CourseTask, TaskSolutionResult, IUserSession } from '../models';
import { TaskSolutionComment, TaskSolutionReview } from '../models/taskSolution';
import { CrossCheckMessage, CrossCheckMessageAuthorRole } from '../models/taskSolutionResult';
import { getTaskSolutionResultById } from './taskResults.service';

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
  constructor(_courseTaskId: number) {}

  public static isCrossCheckTask(courseTask: Partial<CourseTask>) {
    return courseTask.checker === 'crossCheck';
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
