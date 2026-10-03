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
import { BulkIssueResultDto } from './dto/bulk-issue-result.dto';
import { EligibleStudentsCriteriaDto } from './dto/eligible-students-criteria.dto';
import { CertificateMetadataDto } from './dto/certificate-metadata.dto';
import { CertificateIssuanceRequestDto } from './dto/certificate-issuance-request.dto';
import { EligibleStudentDto } from './dto/eligible-student.dto';
import { EligibleStudentsPreviewDto } from './dto/eligible-students-preview.dto';
import { CloudApiService } from '../cloud-api/cloud-api.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

type TaskCriteria = { courseTaskId: number; minScore: number };

/**
 * Collapses both accepted criteria shapes into per-task thresholds: explicit
 * `taskCriteria` wins, otherwise the legacy flat form is expanded by giving
 * every listed task the shared `minScore`. Mirrors buildCourseCertificateRequests
 * so the preview/bulk endpoints and the UI issue path agree on who is eligible.
 */
function normalizeTaskCriteria(criteria: EligibleStudentsCriteriaDto): TaskCriteria[] {
  if (criteria.taskCriteria?.length) {
    return criteria.taskCriteria.map(({ courseTaskId, minScore }) => ({
      courseTaskId: Number(courseTaskId),
      minScore: minScore ? Number(minScore) : 1,
    }));
  }
  const minScore = criteria.minScore ?? 1;
  return (criteria.courseTaskIds ?? []).map(courseTaskId => ({ courseTaskId: Number(courseTaskId), minScore }));
}

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
    private readonly cloudApi: CloudApiService,
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

  public async previewEligibleStudents(
    courseId: number,
    criteria: EligibleStudentsCriteriaDto,
  ): Promise<EligibleStudentsPreviewDto> {
    const students = await this.findEligibleStudents(courseId, criteria);
    return new EligibleStudentsPreviewDto(students);
  }

  public async requestBulkCertificateIssuance(
    courseId: number,
    criteria: EligibleStudentsCriteriaDto,
  ): Promise<BulkIssueResultDto> {
    const eligible = await this.findEligibleStudents(courseId, criteria);
    if (eligible.length === 0) {
      return new BulkIssueResultDto([]);
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['discipline'],
    });
    if (!course) throw new NotFoundException(`Course ${courseId} not found`);

    const payloads: CertificateIssuanceRequestDto[] = eligible.map(
      s =>
        new CertificateIssuanceRequestDto({
          courseId,
          courseName: course.name,
          coursePrimarySkill: course.discipline?.name ?? course.primarySkillName ?? null,
          certificateIssuer: course.certificateIssuer ?? null,
          studentId: s.studentId,
          studentName: s.name,
          timestamp: Date.now(),
        }),
    );

    await this.cloudApi.requestCertificate(payloads);
    return new BulkIssueResultDto(eligible);
  }

  public async findEligibleStudents(
    courseId: number,
    criteria: EligibleStudentsCriteriaDto,
  ): Promise<EligibleStudentDto[]> {
    const ids = await this.findEligibleStudentIds(courseId, {
      taskCriteria: normalizeTaskCriteria(criteria),
      minTotalScore: criteria.minTotalScore,
    });

    if (ids.length === 0) return [];

    const students = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.certificate', 'certificate')
      .where('student.id IN (:...ids)', { ids })
      .andWhere('student.isExpelled = false')
      .andWhere('student.isFailed = false')
      .andWhere('certificate.id IS NULL')
      .getMany();

    return students.map(
      s =>
        new EligibleStudentDto({
          studentId: s.id,
          githubId: s.user.githubId,
          name: [s.user.firstName, s.user.lastName].filter(Boolean).join(' ').trim(),
          totalScore: s.totalScore ?? 0,
        }),
    );
  }

  private async findEligibleStudentIds(
    courseId: number,
    params: { taskCriteria: TaskCriteria[]; minTotalScore: number },
  ): Promise<number[]> {
    const { taskCriteria, minTotalScore } = params;
    const tasksCount = taskCriteria.length;
    const courseTaskIds = taskCriteria.map(c => c.courseTaskId);

    if (tasksCount === 0) {
      const rows = await this.studentRepository
        .createQueryBuilder('student')
        .select('student.id', 'id')
        .leftJoin('student.certificate', 'certificate')
        .where('student.courseId = :courseId', { courseId })
        .andWhere('student.isExpelled = false')
        .andWhere('student.isFailed = false')
        .andWhere('certificate.id IS NULL')
        .andWhere('student.totalScore >= :minTotalScore', { minTotalScore })
        .getRawMany<{ id: number }>();
      return rows.map(r => r.id);
    }

    // Each task carries its own threshold, so the FILTER is an OR over
    // (task, minScore) pairs rather than one shared `score >= :minScore`.
    const scoreParams = Object.fromEntries(
      taskCriteria.flatMap(({ courseTaskId, minScore }, i) => [
        [`ct${i}`, courseTaskId],
        [`ms${i}`, minScore],
      ]),
    );
    const passesCriteria = (alias: string) =>
      taskCriteria.map((_, i) => `("${alias}"."courseTaskId" = :ct${i} AND "${alias}"."score" >= :ms${i})`).join(' OR ');

    const raw = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.id', 'student_id')
      .addSelect(
        `array_remove(ARRAY_AGG(DISTINCT "tr"."courseTaskId") FILTER (WHERE ${passesCriteria('tr')}), NULL)`,
        'tasks',
      )
      .addSelect(
        `array_remove(ARRAY_AGG(DISTINCT "ir"."courseTaskId") FILTER (WHERE ${passesCriteria('ir')}), NULL)`,
        'interviews',
      )
      .leftJoin('student.taskResults', 'tr', 'tr.courseTaskId IN (:...courseTaskIds)', { courseTaskIds })
      .leftJoin('student.taskInterviewResults', 'ir', 'ir.courseTaskId IN (:...courseTaskIds)', { courseTaskIds })
      .where('student.courseId = :courseId', { courseId })
      .andWhere('student.isExpelled = false')
      .andWhere('student.isFailed = false')
      .andWhere('student.totalScore >= :minTotalScore', { minTotalScore })
      .setParameters(scoreParams)
      .groupBy('student.id')
      .getRawMany<{ student_id: number; tasks: number[] | null; interviews: number[] | null }>();

    return raw
      .filter(({ tasks, interviews }) => {
        const all = new Set<number>([...(tasks ?? []), ...(interviews ?? [])]);
        return all.size === tasksCount;
      })
      .map(({ student_id }) => student_id);
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
    data: {
      criteria?: {
        taskCriteria?: { courseTaskId: number; minScore: number }[];
        courseTaskIds?: number[];
        minScore?: number;
        minTotalScore?: number;
      };
      templateId?: string;
    },
  ) {
    const templateId = this.resolveTemplateId(data.templateId);
    const { taskCriteria, courseTaskIds, minScore, minTotalScore } = data.criteria ?? {};
    const normalizedTaskCriteria = taskCriteria?.length
      ? taskCriteria.map(({ courseTaskId, minScore }) => ({
          courseTaskId: Number(courseTaskId),
          minScore: minScore ? Number(minScore) : 1,
        }))
      : (courseTaskIds ?? []).map(courseTaskId => ({
          courseTaskId: Number(courseTaskId),
          minScore: minScore ? Number(minScore) : 1,
        }));
    const emptyCriteria = !minScore && !minTotalScore && normalizedTaskCriteria.length === 0;
    const studentIds = await this.findStudentIdsByCriteria(courseId, {
      taskCriteria: normalizedTaskCriteria,
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
      taskCriteria: { courseTaskId: number; minScore: number }[];
      minTotalScore: number | null;
    },
  ): Promise<number[]> {
    const tasksCount = criteria.taskCriteria.length;

    let query = this.studentRepository.createQueryBuilder('student').select(['student.id']);
    if (tasksCount > 0) {
      const taskParams = Object.fromEntries(
        criteria.taskCriteria.flatMap(({ courseTaskId, minScore }, index) => [
          [`courseTaskId${index}`, courseTaskId],
          [`minScore${index}`, minScore],
        ]),
      );
      const buildTaskConditions = (alias: string) =>
        criteria.taskCriteria
          .map(
            (_, index) =>
              `("${alias}"."courseTaskId" = :courseTaskId${index} AND "${alias}"."score" >= :minScore${index})`,
          )
          .join(' OR ');

      query = query
        .leftJoin(
          'student.taskResults',
          'tr',
          `tr.studentId = student.id AND (${buildTaskConditions('tr')})`,
          taskParams,
        )
        .addSelect('array_remove(ARRAY_AGG (DISTINCT "tr"."courseTaskId"), NULL) AS "tasks"');

      query = query
        .leftJoin(
          'student.taskInterviewResults',
          'interviewResults',
          `interviewResults.studentId = student.id AND (${buildTaskConditions('interviewResults')})`,
          taskParams,
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
