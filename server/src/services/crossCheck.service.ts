import { CourseTask } from '../models';
import { TaskSolutionComment, TaskSolutionReview } from '../models/taskSolution';

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
}
