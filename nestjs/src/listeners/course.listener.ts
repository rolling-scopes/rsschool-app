import { S3 } from '@aws-sdk/client-s3';
import { Course } from '@entities/course';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ExportCourseDto } from 'src/courses/dto';
import { MoreThanOrEqual, Not, Repository } from 'typeorm';
import { ConfigService } from '../config';

@Injectable()
export class CourseListener {
  private s3: S3;
  private logger = new Logger(CourseListener.name);

  private readonly objectKey = 'app/courses.json';
  private readonly bucket;

  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>,
    private readonly httpService: HttpService,
    readonly configService: ConfigService,
  ) {
    this.s3 = new S3(this.configService.awsClient);
    this.bucket = this.configService.buckets.cdn;
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleCoursesChange() {
    const courses = await this.findExportCourses();

    // export courses to S3
    const changed = await this.exportCoursesToS3Conditionally(courses);

    if (changed) {
      // trigger rs site update
      this.triggerSiteUpdate();
    }
  }

  /**
   * Find courses to export to S3 for availability in rs.school
   */
  private async findExportCourses() {
    const courses = await this.repository.find({
      where: {
        completed: false,
        registrationEndDate: MoreThanOrEqual(new Date()),
        alias: Not('test-course'),
        inviteOnly: Not(true),
      },
      relations: ['discipline'],
    });

    return courses.map(course => new ExportCourseDto(course));
  }

  /**
   * Trigger site update via Github Actions
   */
  private triggerSiteUpdate() {
    if (!this.configService.auth.github.integrationSiteToken) {
      this.logger.warn('No integration site token');
      return;
    }

    // It dispatches event to the site repository and triggers workflow to rebuild the site
    // rs.school site needs to be updated when courses are changed.
    this.httpService
      .post(
        'https://api.github.com/repos/rolling-scopes/site/dispatches',
        { event_type: 'course.updated' },
        {
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${this.configService.auth.github.integrationSiteToken}`,
          },
        },
      )
      .subscribe({
        error: error => {
          this.logger.error('Error dispatching course event to the site repository', (error as Error)?.message);
        },
      });
  }

  /**
   * Write courses to S3 if they are changed
   * @param data - courses data
   * @returns true if courses are changed, false otherwise
   */
  private async exportCoursesToS3Conditionally(data: ExportCourseDto[]) {
    if (this.configService.env !== 'prod') {
      return false;
    }

    const current = await this.s3.getObject({ Bucket: this.bucket, Key: this.objectKey }).catch(() => null);
    const serialized = JSON.stringify(data);
    if (current?.Body?.toString() === serialized) {
      return false;
    }
    await this.s3.putObject({ Bucket: this.bucket, Key: this.objectKey, Body: serialized, CacheControl: 'max-age=30' });
    return true;
  }
}
