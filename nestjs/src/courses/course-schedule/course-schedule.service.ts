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
import { Course } from '@entities/course';

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
  CrossCheckSubmit = 'cross-check-submit',
  CrossCheckReview = 'cross-check-review',
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
    @InjectRepository(Course)
    readonly courseRepository: Repository<Course>,
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
      this.getActiveCourseTasks(courseId, studentId),
      this.getCourseEvents(courseId, studentId),
    ]);

    const [taskResults, interviewResults, technicalScreeningResults, taskSolutions, taskCheckers] = await Promise.all([
      this.getTaskResults(studentId),
      this.getInterviewResults(studentId),
      this.getPrescreeningResults(studentId),
      this.getTaskSolutions(studentId),
      this.getTaskCheckers(studentId),
    ]);

    const schedule = courseTasks
      .reduce<CourseScheduleItem[]>((acc, courseTask) => {
        const { id, courseId, studentStartDate, studentEndDate, maxScore, scoreWeight, crossCheckEndDate } = courseTask;
        const { name } = courseTask.task;

        const isCrossCheckTask = courseTask.checker === Checker.CrossCheck;

        const currentScore = this.getCurrentTaskScore(id, taskResults, interviewResults, technicalScreeningResults);
        const submitted = this.getCourseTaskSubmitted(courseTask.id, taskSolutions, taskCheckers);
        const status = this.getCourseTaskStatus(
          { startTime: courseTask.studentStartDate, endTime: courseTask.studentEndDate },
          studentId ? { currentScore, submitted } : undefined,
        );
        const tag = this.getCourseTaskTag(courseTask);

        if (isCrossCheckTask) {
          const scheduleItems = this.transformCrossCheckTask(courseTask, submitted, currentScore, studentId);
          acc.push(...scheduleItems);
        } else {
          const scheduleItem = {
            id,
            name,
            courseId,
            startDate: studentStartDate,
            endDate: studentEndDate,
            crossCheckEndDate,
            maxScore,
            scoreWeight,
            score: currentScore,
            status,
            tag,
            descriptionUrl: courseTask.task.descriptionUrl,
            organizer: courseTask.taskOwner ? new PersonDto(courseTask.taskOwner) : null,
          } as CourseScheduleItem;

          acc.push(scheduleItem);
        }

        return acc;
      }, [])
      .concat(
        courseEvents.map(courseEvent => {
          const { courseId, dateTime, endTime, id } = courseEvent;
          const { name } = courseEvent.event;
          const tag = this.getCourseEventTag(courseEvent);
          return {
            id,
            name,
            courseId,
            startDate: dateTime,
            endDate: endTime,
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

  public getCourseTaskSubmitted(courseTaskId: number, taskSolutions: TaskSolution[], taskCheckers: TaskChecker[]) {
    return (
      taskSolutions.some(courseTask => courseTask.id === courseTaskId) ||
      taskCheckers.some(courseTask => courseTask.id === courseTaskId)
    );
  }

  public transformCrossCheckTask(
    crossCheckTask: CourseTask,
    submitted: boolean,
    currentScore: number | null,
    studentId?: number,
  ): CourseScheduleItem[] {
    const submitRange = { startTime: crossCheckTask.studentStartDate, endTime: crossCheckTask.studentEndDate };
    const reviewRange = { startTime: crossCheckTask.studentEndDate, endTime: crossCheckTask.crossCheckEndDate };

    const submitItem = {
      id: crossCheckTask.id,
      name: crossCheckTask.task.name,
      courseId: crossCheckTask.courseId,
      startDate: crossCheckTask.studentStartDate,
      endDate: crossCheckTask.studentEndDate,
      status: this.getCourseTaskStatus(submitRange, studentId ? { currentScore, submitted } : undefined),
      tag: CourseScheduleItemTag.CrossCheckSubmit,
      descriptionUrl: crossCheckTask.task.descriptionUrl,
      organizer: crossCheckTask.taskOwner ? new PersonDto(crossCheckTask.taskOwner) : null,
    };

    const reviewItem = {
      id: crossCheckTask.id,
      name: crossCheckTask.task.name,
      courseId: crossCheckTask.courseId,
      startDate: crossCheckTask.studentEndDate,
      endDate: crossCheckTask.crossCheckEndDate,
      status: this.getCourseTaskStatus(reviewRange, studentId ? { currentScore, submitted } : undefined),
      tag: CourseScheduleItemTag.CrossCheckReview,
      descriptionUrl: crossCheckTask.task.descriptionUrl,
      organizer: crossCheckTask.taskOwner ? new PersonDto(crossCheckTask.taskOwner) : null,
    };

    return [submitItem, reviewItem] as CourseScheduleItem[];
  }

  public async copyFromTo(fromCourseId: number, toCourseId: number) {
    const [fromCourse, toCourse] = await Promise.all([
      this.courseRepository.findOneByOrFail({ id: fromCourseId }),
      this.courseRepository.findOneByOrFail({ id: toCourseId }),
    ]);

    const timeDiff = toCourse.startDate.getTime() - fromCourse.startDate.getTime();
    const courseTasks = await this.courseTaskRepository.find({ where: { courseId: fromCourseId } });
    for (const courseTask of courseTasks) {
      const { id, createdDate, updatedDate, crossCheckStatus, ...newCourseTask } = courseTask;
      newCourseTask.courseId = toCourseId;
      newCourseTask.crossCheckEndDate = this.adjustDate(newCourseTask.crossCheckEndDate, timeDiff);
      newCourseTask.studentStartDate = this.adjustDate(newCourseTask.studentStartDate, timeDiff);
      newCourseTask.studentEndDate = this.adjustDate(newCourseTask.studentEndDate, timeDiff);
      newCourseTask.mentorStartDate = this.adjustDate(newCourseTask.mentorStartDate, timeDiff);
      newCourseTask.mentorEndDate = this.adjustDate(newCourseTask.mentorEndDate, timeDiff);
      await this.courseTaskRepository.save(newCourseTask);
    }
    const courseEvents = await this.courseEventRepository.find({ where: { courseId: fromCourseId } });
    for (const courseEvent of courseEvents) {
      const { id, createdDate, updatedDate, ...newCourseEvent } = courseEvent;
      newCourseEvent.courseId = toCourseId;
      newCourseEvent.dateTime = this.adjustDate(newCourseEvent.dateTime, timeDiff);
      newCourseEvent.date = null;
      newCourseEvent.time = null;
      await this.courseEventRepository.save(newCourseEvent);
    }
  }

  private adjustDate(date: string | Date | null, timeDiff: number): Date | null {
    const fixedDate = typeof date === 'string' ? new Date(date) : date;
    return fixedDate ? new Date((fixedDate as Date).getTime() + timeDiff) : fixedDate;
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

  private async getActiveCourseTasks(courseId: number, studentId?: number): Promise<CourseTask[]> {
    return this.courseTaskRepository.find({
      where: { courseId, disabled: false },
      relations: ['task', 'taskOwner'],
      cache: studentId ? 90 * 1000 : undefined,
    });
  }

  private async getCourseEvents(courseId: number, studentId?: number): Promise<CourseEvent[]> {
    return this.courseEventRepository.find({
      where: { courseId },
      relations: ['event', 'organizer'],
      cache: studentId ? 90 * 1000 : undefined,
    });
  }

  private getEventStatus(courseEvent: CourseEvent) {
    const startTime = (courseEvent.dateTime as Date).getTime();
    const endTime = courseEvent.endTime ?? startTime + (courseEvent.duration ?? 60) * 1000 * 60;
    if (endTime < Date.now()) {
      return CourseScheduleItemStatus.Archived;
    }
    if (startTime < Date.now()) {
      return CourseScheduleItemStatus.Available;
    }
    return CourseScheduleItemStatus.Future;
  }

  private getCourseTaskStatus(
    range: { startTime: string | Date | null; endTime: string | Date | null },
    studentData?: { currentScore: number | null; submitted: boolean },
  ) {
    if (!range.startTime || !range.endTime) {
      return CourseScheduleItemStatus.Archived;
    }
    const startTime = new Date(range.startTime).getTime();
    const endTime = new Date(range.endTime).getTime();
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

    if (taskType === 'selfeducation' || taskType === 'test') {
      return CourseScheduleItemTag.Test;
    }
    if (taskType === 'interview' || taskType === 'stage-interview') {
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
