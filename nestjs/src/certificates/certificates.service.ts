import { Readable } from 'stream';
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '@entities/certificate';
import { SaveCertificateDto } from './dto/save-certificate-dto';

import { ConfigService } from 'src/config';
import { Student } from '@entities/student';
import { Course } from '@entities/course';
import { User } from '@entities/user';
import { CertificateMetadataDto } from './dto/certificate-metadata.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CertificationsService {
  private s3: S3;

  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.s3 = new S3(this.configService.awsClient);
  }

  public async getByPublicId(publicId: string) {
    return this.certificateRepository.findOne({
      where: { publicId },
      relations: ['student'],
    });
  }

  public async getCertificateMetadata(certificate: Certificate): Promise<CertificateMetadataDto> {
    const [user, course] = await Promise.all([
      this.userRepository.findOneByOrFail({ id: certificate.student.userId }),
      this.courseRepository.findOne({
        where: { id: certificate.student.courseId },
        relations: ['discipline'],
      }),
    ]);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return new CertificateMetadataDto(certificate, course, user);
  }

  public async getFileStream(bucket: string, key: string) {
    const { Body } = await this.s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return Body as Readable;
  }

  public async saveCertificate(studentId: number, data: SaveCertificateDto) {
    let certificate = await this.getByPublicId(data.publicId);
    if (certificate) {
      await this.certificateRepository.update(certificate.id, data);
      return;
    }

    certificate = await this.certificateRepository.findOne({ where: { studentId } });
    if (certificate) {
      await this.certificateRepository.update(certificate.id, data);
      return;
    }

    await this.certificateRepository.save(data);
  }

  public async buildNotificationData(student: Student, data: SaveCertificateDto) {
    const course = await this.courseRepository.findOneByOrFail({ id: student.courseId });
    return {
      userId: student.userId,
      notification: {
        course: course,
        publicId: data.publicId,
      },
    };
  }

  public async removeCertificate(studentId: number) {
    const certificate = await this.certificateRepository.findOneOrFail({
      where: { studentId },
    });

    await Promise.all([
      lastValueFrom(
        this.httpService.delete(`${this.configService.awsServices.restApiUrl}/certificate/${certificate.s3Key}`),
      ),
      this.certificateRepository.remove(certificate),
    ]);
  }

  public resolveTemplateId(input: unknown): string {
    return typeof input === 'string' && CertificationsService.ALLOWED_CERTIFICATE_TEMPLATE_IDS.has(input)
      ? input
      : CertificationsService.DEFAULT_CERTIFICATE_TEMPLATE_ID;
  }

  public async buildStudentCertificateRequest(courseId: number, githubId: string, templateId?: string) {
    const student = await this.studentRepository.findOne({
      where: {
        courseId: Number(courseId),
        user: { githubId },
      },
      relations: ['user', 'course', 'course.discipline'],
    });

    if (student == null) {
      return null;
    }
    return {
      courseId,
      courseName: student.course.name,
      coursePrimarySkill: student.course.discipline?.name ?? student.course.primarySkillName,
      certificateIssuer: student.course.certificateIssuer,
      studentId: student.id,
      studentName: `${student.user.firstName} ${student.user.lastName}`,
      timestamp: Date.now(),
      templateId: this.resolveTemplateId(templateId),
    };
  }

  public async buildCourseCertificateRequests(
    courseId: number,
    data: { criteria?: { courseTaskIds?: number[]; minScore?: number; minTotalScore?: number }; templateId?: string },
  ) {
    const templateId = this.resolveTemplateId(data.templateId);
    const { courseTaskIds, minScore, minTotalScore } = data.criteria ?? {};
    const emptyCriteria = !minScore && !minTotalScore && (!courseTaskIds || !courseTaskIds?.length);
    const studentIds = await this.findStudentIdsByCriteria(courseId, {
      courseTaskIds: courseTaskIds ?? [],
      minScore: minScore != null ? Number(minScore) : null,
      minTotalScore: minTotalScore != null ? Number(minTotalScore) : null,
    });

    if (studentIds.length === 0 && !emptyCriteria) {
      return { requests: [], shortCircuit: true };
    }

    let students: Student[];
    const initialQuery = this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.course', 'course')
      .innerJoin('course.discipline', 'discipline')
      .innerJoin('student.user', 'user')
      .addSelect([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.githubId',
        'course.name',
        'course.disciplineId',
        'course.primarySkillName',
        'course.certificateIssuer',
        'discipline.name',
        'discipline.id',
      ]);
    if (studentIds.length > 0) {
      students = await initialQuery.where('student."id" IN (:...ids)', { ids: studentIds }).getMany();
    } else {
      students = await initialQuery
        .leftJoinAndSelect('student.certificate', 'certificate')
        .where(
          [
            'certificate.id IS NULL',
            'student."courseId" = :courseId',
            'student."isExpelled" = false',
            'student."isFailed" = false',
          ].join(' AND '),
          {
            courseId,
          },
        )
        .getMany();
    }

    const requests = students.map(student => {
      const course = student.course!;
      const user = student.user!;
      return {
        courseId,
        courseName: course.name,
        coursePrimarySkill: course.discipline?.name ?? course.primarySkillName,
        certificateIssuer: course.certificateIssuer,
        studentId: student.id,
        studentName: `${user.firstName} ${user.lastName}`,
        timestamp: Date.now(),
        templateId,
      };
    });
    return { requests, shortCircuit: false };
  }

  public async requestCertificates(payload: object | object[]) {
    const { restApiUrl, restApiKey } = this.configService.awsServices;
    await lastValueFrom(
      this.httpService.post(`${restApiUrl}/certificate`, payload, {
        headers: { 'x-api-key': restApiKey },
      }),
    );
  }

  private async findStudentIdsByCriteria(
    courseId: number,
    criteria: {
      courseTaskIds: number[];
      minScore: number | null;
      minTotalScore: number | null;
    },
  ): Promise<number[]> {
    const tasksCount = criteria.courseTaskIds.length;

    let query = this.studentRepository.createQueryBuilder('student').select(['student.id']);
    if (tasksCount > 0) {
      query = query
        .leftJoin(
          'student.taskResults',
          'tr',
          'tr.studentId = student.id AND tr.score >= :minScore AND tr.courseTaskId IN (:...requiredCourseTaskIds)',
          {
            requiredCourseTaskIds: criteria.courseTaskIds,
            minScore: criteria.minScore ? criteria.minScore : 1,
          },
        )
        .addSelect('array_remove(ARRAY_AGG (DISTINCT "tr"."courseTaskId"), NULL) AS "tasks"');

      query = query
        .leftJoin(
          'student.taskInterviewResults',
          'interviewResults',
          'interviewResults.studentId = student.id AND interviewResults.score >= :minScore AND interviewResults.courseTaskId IN (:...requiredCourseTaskIds)',
          {
            requiredCourseTaskIds: criteria.courseTaskIds,
            minScore: criteria.minScore ? criteria.minScore : 1,
          },
        )
        .addSelect('array_remove(ARRAY_AGG (DISTINCT "interviewResults"."courseTaskId"), NULL) AS "interviews"');
    }

    query = query.where('student.courseId = :courseId', { courseId }).andWhere('student.isExpelled = false');

    if (criteria.minTotalScore != null) {
      query = query.andWhere('student.totalScore >= :minTotalScore', {
        minTotalScore: typeof criteria.minTotalScore === 'number' ? criteria.minTotalScore : 1,
      });
    }

    if (tasksCount > 0) {
      query = query.andWhere('(tr.id IS NOT NULL OR interviewResults.id IS NOT NULL)');
    }
    query = query.groupBy('"student"."id"');

    const rawCertificates = await query.getRawMany();
    return rawCertificates
      .map(({ student_id, tasks = [], interviews = [] }) => {
        if (!tasksCount) {
          return student_id;
        }
        if (tasks.length + interviews.length === tasksCount) {
          return student_id;
        }
        return undefined;
      })
      .filter(Boolean);
  }

  private static readonly ALLOWED_CERTIFICATE_TEMPLATE_IDS = new Set(['default', 'bootcamp_13_weeks']);
  private static readonly DEFAULT_CERTIFICATE_TEMPLATE_ID = 'default';
}
