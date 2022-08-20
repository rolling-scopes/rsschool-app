import { TaskChecker } from '@entities/taskChecker';
import { CourseEvent } from '@entities/courseEvent';
import { Checker, CourseTask } from '@entities/courseTask';
import { StageInterview } from '@entities/stageInterview';
import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { TaskResult } from '@entities/taskResult';
import { TaskSolution } from '@entities/taskSolution';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonDto } from 'src/core/dto';
import { Repository } from 'typeorm';
import { EventType } from '../course-events/dto/course-event.dto';

export type CourseScheduleItem = Pick<CourseTask, 'id' | 'courseId'> &
  Partial<Pick<CourseTask, 'maxScore' | 'scoreWeight'>> & {
    startDate: Date;
    endDate: Date;
    name: string;
    organizer?: PersonDto;
    score?: number;
    status: CourseScheduleItemStatus;
    tag: CourseScheduleItemTag;
    descriptionUrl?: string;
  };

export enum CourseScheduleDataSource {
  CourseTask = 'courseTask',
  CourseEvent = 'courseEvent',
}

export enum CourseScheduleItemTag {
  Lecture = 'lecture',
  Coding = 'coding',
  SelfStudy = 'self-study',
  Interview = 'interview',
  CrossCheck = 'cross-check',
  Test = 'test',
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

        const currentScore = this.getCurrentTaskScore(id, taskResults, interviewResults, technicalScreeningResults);
        const submitted =
          taskSolutions.some(({ courseTaskId }) => courseTaskId === id) ||
          taskCheckers.some(({ courseTaskId }) => courseTaskId === id);
        const status = this.getCourseTaskStatus(courseTask, studentId ? { currentScore, submitted } : undefined);
        const tag = this.getCourseTaskTag(courseTask);
        return {
          id,
          name,
          courseId,
          startDate: studentStartDate,
          endDate: studentEndDate,
          maxScore,
          scoreWeight,
          score: currentScore,
          status,
          tag,
          descriptionUrl: courseTask.task.descriptionUrl,
        } as CourseScheduleItem;
      })
      .concat(
        courseEvents.map(courseEvent => {
          const { courseId, dateTime, id } = courseEvent;
          const { name } = courseEvent.event;
          const tag = this.getCourseEventTag(courseEvent);
          return {
            id,
            name,
            courseId,
            startDate: dateTime,
            endDate: dateTime,
            status: this.getEventStatus(courseEvent),
            tag,
            descriptionUrl: courseEvent.event.descriptionUrl,
            organizer: new PersonDto(courseEvent.organizer),
          } as CourseScheduleItem;
        }),
      )
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return schedule;
  }

  private getCurrentTaskScore(
    courseTaskId: number,
    taskResults: TaskResult[],
    interviewResults: TaskInterviewResult[],
    technicalScreeningResults: StageInterview[],
  ) {
    const scoreRaw =
      taskResults.find(task => task.courseTaskId === courseTaskId)?.score ??
      interviewResults.find(task => task.courseTaskId === courseTaskId)?.score ??
      Math.max(
        ...(technicalScreeningResults
          .find(task => task.courseTaskId === courseTaskId)
          ?.stageInterviewFeedbacks.map(feedback => JSON.parse(feedback.json))
          .map(json => json?.resume?.score ?? 0) ?? []),
      );
    const currentScore = isFinite(scoreRaw) ? scoreRaw : null;
    return currentScore;
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

  private getCourseTaskTag(courseTask: CourseTask): CourseScheduleItemTag {
    const taskType = courseTask.type || courseTask.task.type;

    if (courseTask.checker == Checker.CrossCheck) {
      return CourseScheduleItemTag.CrossCheck;
    }
    if (taskType === 'selfeducation' || taskType === 'test') {
      return CourseScheduleItemTag.Test;
    }
    if (taskType === 'interview' || taskType == 'stage-interview') {
      return CourseScheduleItemTag.Interview;
    }
    return CourseScheduleItemTag.Coding;
  }

  private getCourseEventTag(courseEvent: CourseEvent): CourseScheduleItemTag {
    const type = courseEvent.event.type as EventType;
    switch (type) {
      case EventType.SelfStudy:
        return CourseScheduleItemTag.SelfStudy;
      default:
        return CourseScheduleItemTag.Lecture;
    }
  }
}
