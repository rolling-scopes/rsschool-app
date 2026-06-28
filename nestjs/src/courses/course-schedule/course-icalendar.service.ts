import { User } from '@entities/user';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ical from 'ical-generator';
import { formatInTimeZone } from 'date-fns-tz';
import { CourseScheduleItem, CourseScheduleItemTag } from './course-schedule.service';

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
      // CrossCheck has two events: submit and review and they have the same task id. iCal requires unique id for each event.
      const id = item.tag === CourseScheduleItemTag.CrossCheckReview ? `${item.id}-1` : item.id;
      const endDate = item.endDate || new Date(item.startDate.getTime() + 1000 * 60 * 60);
      icalData.createEvent({
        start: formatInTimeZone(item.startDate, timezone, "yyyy-MM-dd'T'HH:mm"),
        end: formatInTimeZone(endDate, timezone, "yyyy-MM-dd'T'HH:mm"),
        summary: item.name,
        description: this.buildDescription(item),
        id,
        alarms: [],
        organizer: item.organizer ? { name: item.organizer?.name ?? '', email: 'user@example.com' } : undefined,
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
