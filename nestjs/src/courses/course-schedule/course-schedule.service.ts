import { TaskChecker } from '@entities/taskChecker';
import { CourseEvent } from '@entities/courseEvent';
import { CourseTask } from '@entities/courseTask';
import { StageInterview } from '@entities/stageInterview';
import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { TaskResult } from '@entities/taskResult';
import { TaskSolution } from '@entities/taskSolution';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonDto } from 'src/core/dto';
import { Repository } from 'typeorm';

export type CourseScheduleItem = Pick<CourseTask, 'id' | 'courseId'> &
  Partial<Pick<CourseTask, 'maxScore' | 'scoreWeight'>> & {
    studentStartDate: Date;
    studentEndDate: Date;
    name: string;
    organizer?: PersonDto;
    currentScore?: number;
    status: CourseScheduleItemStatus;
    dataSource: CourseScheduleDataSource;
    tags: string[];
    descriptionUrl?: string;
  };

export enum CourseScheduleDataSource {
  CourseTask = 'courseTask',
  CourseEvent = 'courseEvent',
}

export enum CourseScheduleItemStatus {
  Done = 'done',
  Available = 'available',
  Archived = 'archived',
  Future = 'future',
  Missed = 'missed',
  Review = 'review',
}

@Injectable()
export class CourseScheduleService {
  constructor(
    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
    @InjectRepository(CourseEvent)
    readonly courseEventRepository: Repository<CourseEvent>,
    @InjectRepository(TaskResult)
    readonly taskResultRepository: Repository<TaskResult>,
    @InjectRepository(TaskInterviewResult)
    readonly taskInterviewResultRepository: Repository<TaskInterviewResult>,
    @InjectRepository(StageInterview)
    readonly stageInterviewRepository: Repository<StageInterview>,
    @InjectRepository(TaskSolution)
    readonly taskSolutionRepository: Repository<TaskSolution>,
    @InjectRepository(TaskChecker)
    readonly taskCheckerRepository: Repository<TaskChecker>,
  ) {}

  public async getAll(courseId: number, studentId?: number): Promise<CourseScheduleItem[]> {
    const [courseTasks, courseEvents] = await Promise.all([
      this.getActiveCourseTasks(courseId),
      this.getCourseEvents(courseId),
    ]);
    const [taskResults, interviewResults, technicalScreeningResults, taskSolutions, taskCheckers] = await Promise.all([
      this.getTaskResults(studentId),
      this.getInterviewResults(studentId),
      this.getPrescreeningResults(studentId),
      this.getTaskSolutions(studentId),
      this.getTaskCheckers(studentId),
    ]);

    const schedule = courseTasks
      .map(courseTask => {
        const { id, courseId, studentStartDate, studentEndDate, maxScore, scoreWeight } = courseTask;
        const { name } = courseTask.task;

        const scoreRaw =
          taskResults.find(({ courseTaskId }) => courseTaskId === id)?.score ??
          interviewResults.find(({ courseTaskId }) => courseTaskId === id)?.score ??
          Math.max(
            ...(technicalScreeningResults
              .find(({ courseTaskId }) => courseTaskId === id)
              ?.stageInterviewFeedbacks.map(feedback => JSON.parse(feedback.json))
              .map(json => json?.resume?.score ?? 0) ?? []),
          );
        const currentScore = isFinite(scoreRaw) ? scoreRaw : null;
        const submitted =
          taskSolutions.some(({ courseTaskId }) => courseTaskId === id) ||
          taskCheckers.some(({ courseTaskId }) => courseTaskId === id);
        const type = courseTask.type || courseTask.task.type;
        return {
          id,
          name,
          courseId,
          studentStartDate,
          studentEndDate,
          maxScore,
          scoreWeight,
          currentScore,
          status: this.getCourseTaskStatus(courseTask, studentId ? { currentScore, submitted } : undefined),
          dataSource: CourseScheduleDataSource.CourseTask,
          tags: type ? [type] : [],
          descriptionUrl: courseTask.task.descriptionUrl,
        } as CourseScheduleItem;
      })
      .concat(
        courseEvents.map(courseEvent => {
          const { courseId, dateTime, id } = courseEvent;
          const { name } = courseEvent.event;
          return {
            id,
            name,
            courseId,
            studentStartDate: dateTime,
            studentEndDate: dateTime,
            status: this.getEventStatus(courseEvent),
            dataSource: CourseScheduleDataSource.CourseEvent,
            tags: courseEvent.event.type ? [courseEvent.event.type] : [],
            descriptionUrl: courseEvent.event.descriptionUrl,
            organizer: new PersonDto(courseEvent.organizer),
          } as CourseScheduleItem;
        }),
      )
      .sort((a, b) => a.studentStartDate.getTime() - b.studentStartDate.getTime());

    return schedule;
  }

  private async getTaskSolutions(studentId: number | undefined): Promise<TaskSolution[]> {
    if (!studentId) {
      return [];
    }
    return this.taskSolutionRepository.find({
      where: { studentId },
      select: ['id', 'url', 'courseTaskId', 'studentId'],
    });
  }

  private async getPrescreeningResults(studentId: number | undefined): Promise<StageInterview[]> {
    if (!studentId) {
      return [];
    }
    return this.stageInterviewRepository.find({
      where: { studentId, isCompleted: true },
      relations: ['stageInterviewFeedbacks'],
    });
  }

  private async getInterviewResults(studentId: number | undefined): Promise<TaskInterviewResult[]> {
    if (!studentId) {
      return [];
    }
    return this.taskInterviewResultRepository.find({
      where: { studentId },
      select: ['id', 'score', 'studentId', 'courseTaskId'],
    });
  }

  private async getTaskResults(studentId: number | undefined): Promise<TaskResult[]> {
    if (!studentId) {
      return [];
    }
    return this.taskResultRepository.find({
      where: { studentId },
      select: ['id', 'score', 'studentId', 'courseTaskId'],
    });
  }

  private async getTaskCheckers(studentId: number | undefined): Promise<TaskChecker[]> {
    if (!studentId) {
      return [];
    }
    return this.taskCheckerRepository.find({
      where: { studentId },
      select: ['id', 'studentId', 'courseTaskId'],
    });
  }

  private async getActiveCourseTasks(courseId: number) {
    return this.courseTaskRepository.find({
      where: { courseId, disabled: false },
      relations: ['task'],
      cache: 60 * 1000,
    });
  }

  private async getCourseEvents(courseId: number) {
    return this.courseEventRepository.find({
      where: { courseId },
      relations: ['event', 'organizer'],
      cache: 60 * 1000,
    });
  }

  private getEventStatus(courseEvent: CourseEvent) {
    const startTime = (courseEvent.dateTime as Date).getTime();
    const endTime = startTime + (courseEvent.duration ?? 60) * 1000 * 60;
    if (endTime < Date.now()) {
      return CourseScheduleItemStatus.Archived;
    }
    if (startTime < Date.now()) {
      return CourseScheduleItemStatus.Available;
    }
    return CourseScheduleItemStatus.Future;
  }

  private getCourseTaskStatus(
    courseTask: CourseTask,
    studentData?: { currentScore: number | null; submitted: boolean },
  ) {
    const startTime = new Date(courseTask.studentStartDate).getTime();
    const endTime = new Date(courseTask.studentEndDate).getTime();
    const { currentScore = null, submitted = false } = studentData ?? {};
    const now = Date.now();
    if (startTime > now) {
      return CourseScheduleItemStatus.Future;
    }
    if (currentScore != null) {
      return CourseScheduleItemStatus.Done;
    }
    if (submitted) {
      return CourseScheduleItemStatus.Review;
    }
    if (startTime <= now && endTime >= now) {
      return CourseScheduleItemStatus.Available;
    }
    return studentData ? CourseScheduleItemStatus.Missed : CourseScheduleItemStatus.Archived;
  }
}
