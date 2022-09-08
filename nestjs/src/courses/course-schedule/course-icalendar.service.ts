import { User } from '@entities/user';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ical from 'ical-generator';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { CourseScheduleItem } from './course-schedule.service';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class CourseICalendarService {
  constructor(
    @InjectRepository(User)
    readonly courseRepository: Repository<User>,
  ) {}

  public async validateUserCourse(courseId: number, payload: { githubId: string; courseId: number }): Promise<boolean> {
    if (Number(payload.courseId) !== courseId) {
      throw new BadRequestException('Invalid Course Id');
    }
    await this.courseRepository.findOneByOrFail({ githubId: payload.githubId });
    return true;
  }

  public async getICalendar(data: CourseScheduleItem[], courseName: string, timezone: string): Promise<string> {
    const icalData = ical({
      name: courseName,
      timezone: timezone,
    });

    for (const item of data) {
      icalData.createEvent({
        start: dayjs.utc(item.startDate).tz(timezone).format('YYYY-MM-DDTHH:mm'),
        end: dayjs.utc(item.endDate).tz(timezone).format('YYYY-MM-DDTHH:mm'),
        summary: item.name,
        description: this.buildDescription(item),
        id: item.id,
        alarms: [],
        organizer: item.organizer ? { name: item.organizer?.name ?? '' } : undefined,
        url: item.descriptionUrl ?? undefined,
      });
    }
    return icalData.toString();
  }

  private buildDescription(item: CourseScheduleItem): string {
    const result = [];

    if (item.organizer) {
      result.push(`🎙 Organizer: ${item.organizer.name} (@${item.organizer.githubId})`);
    }
    if (item.maxScore) {
      result.push(`🏅 Max Score: ${item.maxScore}`);
    }
    if (item.scoreWeight) {
      result.push(`🔼 Score Weight: ${item.scoreWeight}`);
    }
    return result.join('\n\n');
  }
}
