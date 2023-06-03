import { Injectable, Logger } from '@nestjs/common';
import { CoursesService } from 'src/courses/courses.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@entities/user';
import { In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Course } from '@entities/course';
import { Student } from '@entities/student';
import { Mentor } from '@entities/mentor';
import { CourseUser } from '@entities/courseUser';
import { History } from '@entities/history';
import { CourseEvent } from '@entities/courseEvent';
import { CourseTask } from '@entities/courseTask';
import * as dayjs from 'dayjs';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger('schedule');
  constructor(
    private courseService: CoursesService,
    @InjectRepository(User)
    readonly userRepository: Repository<User>,
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
    @InjectRepository(CourseEvent)
    private readonly courseRepository: Repository<CourseEvent>,
  ) {}

  public async getChangedCoursesRecipients(lastHours: number = 2): Promise<Recipients> {
    const courseChangesMap = await this.getCourseChangesMap(lastHours);

    const updatedCourses = await this.courseService.getByIds([...courseChangesMap.keys()], {
      startDate: LessThanOrEqual(new Date()),
      endDate: MoreThanOrEqual(new Date()),
    });

    const aliasMap = new Map(updatedCourses.map(course => [course.alias, course]));

    this.logger.log({ message: `updated courses: ${updatedCourses.map(course => course.name)} ` });
    if (!updatedCourses.length) return [];

    const users = await this.getUsersCourses(updatedCourses.map(c => c.id));

    return users
      .filter(user => user.aliases.length > 0)
      .map(user => [
        user.id,
        user.aliases.map((courseAlias: string) => {
          const course = aliasMap.get(courseAlias) as Course;
          const changes = courseChangesMap.get(course.id) as Map<string, ChangeEvent>;

          return {
            course,
            changes: [...changes.values()],
          };
        }),
      ]);
  }

  private async getUsersCourses(courseIds: number[]) {
    const users: {
      id: number;
      aliases: string[];
    }[] = await this.userRepository
      .createQueryBuilder('user')
      .select('user.id', 'id')
      .addSelect(`array_remove(array_agg(DISTINCT course."alias"), NULL)`, 'aliases')
      .leftJoin(
        Student,
        'student',
        'user.id = student.userId and student.isExpelled = false and student.courseId In (:...courseIds)',
        {
          courseIds,
        },
      )
      .leftJoin(
        Mentor,
        'mentor',
        'user.id = mentor.userId and mentor.isExpelled = false and mentor.courseId In (:...courseIds)',
        {
          courseIds,
        },
      )
      .leftJoin(
        CourseUser,
        'courseUser',
        'user.id = courseUser.userId and courseUser.courseId In (:...courseIds) and courseUser.isManager = true',
        {
          courseIds,
        },
      )
      .innerJoin(
        Course,
        'course',
        '(mentor.courseId = course.id or student.courseId = course.id or courseUser.courseId = course.id)',
      )

      .groupBy('user.id')
      .getRawMany();

    return users;
  }

  private async getCourseChangesMap(lastHours: number) {
    const records = await this.getScheduleUpdatedRecords(lastHours);

    const { courseMap, fetchEvents, fetchTasks } = this.buildChangesMaps(records);
    const taskEventMap = await this.buildTaskEventMap(fetchEvents, fetchTasks);

    courseMap.forEach(recordsMap => {
      recordsMap.forEach((value, key) => {
        const [type, _, id] = key.split('-');
        recordsMap.set(key, {
          ...value,
          name: taskEventMap.get(`${type}-${id}`)?.name ?? '',
        });
      });
    });

    return courseMap;
  }

  private async buildTaskEventMap(fetchEvents: Set<number>, fetchTasks: Set<number>) {
    const courseEntries: {
      name: string;
      id: number;
      type: 'task' | 'event';
    }[] = await this.courseRepository.query(
      `select "name", "id", 'event' as "type"  from "event" where "id" = ANY($1)
        union
       select "name", "id", 'task' as "type"  from "task" where "id" = ANY($2)`,
      [fetchEvents.size > 0 ? [...fetchEvents] : null, [...fetchTasks] || null],
    );
    const entryMap = new Map(courseEntries.map(entry => [`${entry.type}-${entry.id}`, entry]));

    return entryMap;
  }

  private buildChangesMaps(records: History[]) {
    const courseMap = new Map<number, Map<string, ChangeEvent>>();
    const fetchTasks = new Set<number>();
    const fetchEvents = new Set<number>();

    for (const record of records) {
      const { operation, entityId, previous, update } = record;
      const event = record.event as ScheduleEvent;
      const entryUpdate = update as CourseTask | CourseEvent;
      const entryPrevious = previous as CourseTask | CourseEvent;

      const courseId = entryUpdate.courseId || entryPrevious.courseId;
      let recordsMap = courseMap.get(courseId);

      if (!recordsMap) {
        recordsMap = new Map<string, ChangeEvent>();
        courseMap.set(courseId, recordsMap);
      }

      const type = event === 'course_task' ? 'task' : 'event';
      const parentId = this.getParentId(entryUpdate, entryPrevious);
      const entryKey = `${type}-${entityId}-${parentId}`;
      const prevEntry = recordsMap.get(entryKey);
      type === 'event' ? fetchEvents.add(parentId) : fetchTasks.add(parentId);

      if (operation === 'insert') {
        recordsMap.set(entryKey, {
          isNew: true,
          type,
          ...this.getInsertFields(event, entryUpdate),
        });
      } else if (operation === 'remove' || (entryUpdate as CourseTask).disabled === true) {
        recordsMap.set(entryKey, {
          isRemoved: true,
          type,
          ...this.getInsertFields(event, entryPrevious),
        });
      } else if (operation === 'update') {
        recordsMap.set(entryKey, {
          ...prevEntry,
          type,
          ...this.getUpdatedFields(event, entryUpdate, entryPrevious),
        });
      }
    }

    return {
      courseMap,
      fetchTasks,
      fetchEvents,
    };
  }

  private getParentId(updatedEntry: CourseTask | CourseEvent, previousEntry: CourseTask | CourseEvent) {
    if (previousEntry) {
      return (previousEntry as CourseEvent).eventId || (previousEntry as CourseTask).taskId;
    }

    return (updatedEntry as CourseEvent).eventId || (updatedEntry as CourseTask).taskId;
  }

  private async getScheduleUpdatedRecords(lastHours: number) {
    const date = dayjs().subtract(lastHours, 'hours');
    const records = await this.historyRepository
      .createQueryBuilder('entry')
      .where({
        event: In(['course_task', 'course_event']),
        updatedDate: MoreThanOrEqual(date.toISOString()),
      })
      .orderBy('entry."updatedDate"', 'DESC')
      .getMany();

    return records;
  }

  getInsertFields(tableName: ScheduleEvent, entryUpdate: CourseTask | CourseEvent) {
    if (tableName === 'course_event') {
      const event = entryUpdate as CourseEvent;
      const fields: Partial<CourseEvent> = {
        dateTime: event.dateTime,
      };
      if (event.place) {
        fields.place = event.place;
      }

      return fields;
    }

    const task = entryUpdate as CourseTask;
    const fields: Partial<CourseTask> = {
      studentStartDate: task.studentStartDate,
      studentEndDate: task.studentEndDate,
    };
    if (task.crossCheckEndDate) {
      fields.crossCheckEndDate = task.crossCheckEndDate;
    }

    return fields;
  }

  getUpdatedFields(
    tableName: ScheduleEvent,
    entryUpdate: CourseTask | CourseEvent,
    previous: CourseTask | CourseEvent,
  ) {
    if (tableName === 'course_event') {
      const fields: Partial<
        CourseEvent & {
          placeOld: string;
          dateTimeOld: string;
        }
      > = {};

      const event = entryUpdate as CourseEvent;
      const previousEvent = previous as CourseEvent;

      if (event.place !== previousEvent.place) {
        fields.place = event.place;
        fields.placeOld = previousEvent.place;
      }
      if (!this.isDateEqual(event.dateTime, previousEvent.dateTime)) {
        fields.dateTime = event.dateTime;
        fields.dateTimeOld = previousEvent.dateTime as string;
      }

      return Object.keys(fields).length > 0 ? fields : undefined;
    }

    const task = entryUpdate as CourseTask;
    const previousTask = previous as CourseTask;
    const fields: Partial<
      CourseTask & {
        studentStartDateOld: string | Date;
        studentEndDateOld: string | Date;
        crossCheckEndDateOld: string | Date;
      }
    > = {};

    if (!this.isDateEqual(task.studentStartDate, previousTask.studentStartDate)) {
      fields.studentStartDate = task.studentStartDate;
      fields.studentStartDateOld = previousTask.studentStartDate ?? undefined;
    }
    if (!this.isDateEqual(task.studentEndDate, previousTask.studentEndDate)) {
      fields.studentEndDate = task.studentEndDate;
      fields.studentEndDateOld = previousTask.studentEndDate ?? undefined;
    }

    if (!this.isDateEqual(task.crossCheckEndDate, previousTask.crossCheckEndDate)) {
      fields.crossCheckEndDate = task.crossCheckEndDate;
      fields.crossCheckEndDateOld = previousTask.crossCheckEndDate ?? undefined;
    }

    return fields;
  }

  private isDateEqual(date1: string | Date | null, date2: string | Date | null) {
    if (!date1 && !date2) return true;
    return dayjs(date1).isSame(dayjs(date2));
  }
}

type UserCourses = [number, { course: Course; changes: ChangeEvent[] }[]];
type Recipients = UserCourses[];

type ChangeEvent = {
  isNew?: boolean;
  isRemoved?: boolean;
  type: string;
  name?: string;
} & Partial<CourseEvent | CourseTask>;

type ScheduleEvent = 'course_task' | 'course_event';
