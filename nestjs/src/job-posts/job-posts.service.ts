import { Student, Certificate } from '@entities/index';
import { JobPost, JobPostStatus } from '@entities/job-post';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateJobPostDto } from './dto';

const ACTIVE_PERIOD = 1000 * 60 * 60 * 24 * 30 * 6;

@Injectable()
export class JobPostsService {
  constructor(
    @InjectRepository(JobPost)
    private repository: Repository<JobPost>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  public async getAll() {
    const jobPosts = await this.repository.find({});
    return jobPosts;
  }

  public async getAvailable(userId: number) {
    const studentProfiles = await this.studentRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.course', 'course')
      .innerJoin(Certificate, 'cert', 'cert.studentId = s.id')
      .where('s.userId = :userId', { userId })
      .andWhere('s.isExpelled = :status', { status: false })
      .andWhere('cert.createdDate > :date', { date: new Date(Date.now() - ACTIVE_PERIOD) })
      .getMany();

    if (studentProfiles.length === 0) {
      return this.repository.find({ where: { authorId: userId } });
    }

    const jobPosts = await this.repository.find({
      where: {
        disciplineId: In(studentProfiles.map(profile => profile.course.disciplineId)),
        status: JobPostStatus.Published,
      },
    });
    return jobPosts;
  }

  public async getById(id: number) {
    return this.repository.findOneBy({ id });
  }

  public async create(data: CreateJobPostDto, authorId: number) {
    const { id } = await this.repository.save({ ...data, authorId });
    return this.repository.findOneByOrFail({ id });
  }
}
