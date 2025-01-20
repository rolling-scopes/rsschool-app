import { Injectable } from '@nestjs/common';
import { Course } from '@entities/course';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FindOptionsWhere, MoreThanOrEqual, In, Repository } from 'typeorm';
import { S3 } from '@aws-sdk/client-s3';
import { ConfigService } from '../config';
import { UpdateCourseDto, CreateCourseDto, ExportCourseDto } from './dto';

@Injectable()
export class CoursesService {
  private s3: S3;

  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>,
    private readonly configService: ConfigService,
  ) {
    this.s3 = new S3(this.configService.awsClient);
  }

  public async getAll() {
    return this.repository.find({ order: { startDate: 'DESC' }, relations: ['discipline'] });
  }

  public async getById(id: number) {
    return this.repository.findOneOrFail({ where: { id }, relations: ['discipline'] });
  }

  public async update(id: number, course: UpdateCourseDto) {
    await this.repository.update(id, course);
    return this.repository.findOneByOrFail({ id });
  }

  public async create(course: CreateCourseDto) {
    const created = await this.repository.save(course);
    return this.repository.findOneByOrFail({ id: created.id });
  }

  public async getByIds(ids: number[], filter?: FindOptionsWhere<Course>) {
    return this.repository.find({
      where: {
        id: In(ids),
        ...filter,
      },
    });
  }

  public getActiveCourses(relations?: ('students' | 'mentors')[]) {
    return this.repository.find({
      where: {
        completed: false,
      },
      relations,
    });
  }

  // every 1h check if there are any courses that are already completed
  @Cron(CronExpression.EVERY_30_MINUTES)
  public async exportPublicOpenCounrses() {
    const courses = await this.repository.find({
      where: {
        completed: false,
        registrationEndDate: MoreThanOrEqual(new Date()),
      },
      relations: ['discipline'],
    });

    const data: ExportCourseDto[] = courses
      .filter(course => course.alias !== 'test-course')
      .filter(course => !course.inviteOnly)
      .map(course => new ExportCourseDto(course));

    if (this.configService.env === 'prod') {
      this.s3.putObject({
        Bucket: this.configService.buckets.cdn,
        Key: `app/courses.json`,
        Body: JSON.stringify(data),
        CacheControl: 'max-age=900',
        ContentType: 'application/json',
      });
    }
  }
}
