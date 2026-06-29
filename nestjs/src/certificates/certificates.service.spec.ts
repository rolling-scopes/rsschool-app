import { Readable } from 'stream';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { Certificate } from '@entities/certificate';
import { Student } from '@entities/student';
import { Course } from '@entities/course';
import { User } from '@entities/user';
import { ConfigService } from 'src/config';
import { CertificationsService } from './certificates.service';
import { CertificateMetadataDto } from './dto/certificate-metadata.dto';

// Mock the AWS SDK so the S3 client constructed in the service ctor is inert
// and we control GetObjectCommand input + the send() result.
const mockS3Send = vi.fn();
vi.mock('@aws-sdk/client-s3', () => ({
  S3: class {
    send = mockS3Send;
  },
  GetObjectCommand: class {
    input: unknown;
    __command = 'GetObject';
    constructor(input: unknown) {
      this.input = input;
    }
  },
}));

describe('CertificationsService', () => {
  let service: CertificationsService;

  const certificateRepository = {
    findOne: vi.fn(),
    findOneOrFail: vi.fn(),
    update: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
  };
  const courseRepository = { findOne: vi.fn(), findOneByOrFail: vi.fn() };
  const userRepository = { findOneByOrFail: vi.fn() };
  const studentRepository = { findOne: vi.fn(), createQueryBuilder: vi.fn() };
  const mockPost = vi.fn();
  const mockDelete = vi.fn();

  const configValue = {
    awsServices: { restApiUrl: 'https://aws.example.com', restApiKey: 'secret-key' },
    awsClient: { region: 'eu-central-1', credentials: { accessKeyId: 'x', secretAccessKey: 'y' } },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPost.mockReturnValue(of({ data: {} }));
    mockDelete.mockReturnValue(of({ data: {} }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificationsService,
        { provide: getRepositoryToken(Certificate), useValue: certificateRepository },
        { provide: getRepositoryToken(Course), useValue: courseRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        { provide: ConfigService, useValue: configValue },
        { provide: HttpService, useValue: { post: mockPost, delete: mockDelete } },
      ],
    }).compile();

    service = module.get(CertificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getByPublicId', () => {
    it('finds a certificate by publicId with the student relation', async () => {
      const cert = { id: 1, publicId: 'abc' };
      certificateRepository.findOne.mockResolvedValue(cert);

      const result = await service.getByPublicId('abc');

      expect(certificateRepository.findOne).toHaveBeenCalledWith({
        where: { publicId: 'abc' },
        relations: ['student'],
      });
      expect(result).toBe(cert);
    });
  });

  describe('getCertificateMetadata', () => {
    const certificate = {
      publicId: 'abc',
      issueDate: new Date('2026-01-15T00:00:00.000Z'),
      student: { userId: 7, courseId: 3 },
    } as unknown as Certificate;

    it('builds metadata from the user and course', async () => {
      userRepository.findOneByOrFail.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });
      courseRepository.findOne.mockResolvedValue({
        fullName: 'JS Course',
        certificateIssuer: 'RS School',
        discipline: { name: 'JavaScript' },
      });

      const result = await service.getCertificateMetadata(certificate);

      expect(userRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 7 });
      expect(courseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 3 },
        relations: ['discipline'],
      });
      expect(result).toBeInstanceOf(CertificateMetadataDto);
      expect(result.name).toBe('John Doe');
      expect(result.issueDate).toBe('2026-01-15');
    });

    it('throws NotFoundException when the course does not exist', async () => {
      userRepository.findOneByOrFail.mockResolvedValue({ firstName: 'John', lastName: 'Doe' });
      courseRepository.findOne.mockResolvedValue(null);

      await expect(service.getCertificateMetadata(certificate)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFileStream', () => {
    it('sends a GetObjectCommand and returns the response body', async () => {
      const body = Readable.from('pdf-bytes');
      mockS3Send.mockResolvedValue({ Body: body });

      const result = await service.getFileStream('my-bucket', 'my-key');

      expect(mockS3Send).toHaveBeenCalledWith(
        expect.objectContaining({
          __command: 'GetObject',
          input: { Bucket: 'my-bucket', Key: 'my-key' },
        }),
      );
      expect(result).toBe(body);
    });
  });

  describe('saveCertificate', () => {
    const data = { publicId: 'abc', studentId: 42, s3Bucket: 'b', s3Key: 'k', issueDate: '2026-01-01' };

    it('updates the existing certificate found by publicId', async () => {
      certificateRepository.findOne.mockResolvedValueOnce({ id: 1 });

      await service.saveCertificate(42, data);

      expect(certificateRepository.update).toHaveBeenCalledWith(1, data);
      expect(certificateRepository.save).not.toHaveBeenCalled();
    });

    it('updates the certificate found by studentId when none matches publicId', async () => {
      certificateRepository.findOne.mockResolvedValueOnce(null); // by publicId
      certificateRepository.findOne.mockResolvedValueOnce({ id: 2 }); // by studentId

      await service.saveCertificate(42, data);

      expect(certificateRepository.findOne).toHaveBeenNthCalledWith(2, { where: { studentId: 42 } });
      expect(certificateRepository.update).toHaveBeenCalledWith(2, data);
      expect(certificateRepository.save).not.toHaveBeenCalled();
    });

    it('saves a new certificate when no existing one is found', async () => {
      certificateRepository.findOne.mockResolvedValueOnce(null); // by publicId
      certificateRepository.findOne.mockResolvedValueOnce(null); // by studentId

      await service.saveCertificate(42, data);

      expect(certificateRepository.update).not.toHaveBeenCalled();
      expect(certificateRepository.save).toHaveBeenCalledWith(data);
    });
  });

  describe('buildNotificationData', () => {
    it('assembles userId and notification payload from the student course', async () => {
      const course = { id: 3, name: 'JS' };
      courseRepository.findOneByOrFail.mockResolvedValue(course);
      const student = { userId: 7, courseId: 3 } as Student;
      const data = { publicId: 'abc' } as never;

      const result = await service.buildNotificationData(student, data);

      expect(courseRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 3 });
      expect(result).toEqual({
        userId: 7,
        notification: { course, publicId: 'abc' },
      });
    });
  });

  describe('removeCertificate', () => {
    it('deletes the remote artifact and removes the entity in parallel', async () => {
      const certificate = { id: 1, s3Key: 'folder/file.pdf' };
      certificateRepository.findOneOrFail.mockResolvedValue(certificate);

      await service.removeCertificate(99);

      expect(certificateRepository.findOneOrFail).toHaveBeenCalledWith({ where: { studentId: 99 } });
      expect(mockDelete).toHaveBeenCalledWith('https://aws.example.com/certificate/folder/file.pdf');
      expect(certificateRepository.remove).toHaveBeenCalledWith(certificate);
    });
  });

  describe('resolveTemplateId', () => {
    it('keeps an allowed template id', () => {
      expect(service.resolveTemplateId('bootcamp_13_weeks')).toBe('bootcamp_13_weeks');
      expect(service.resolveTemplateId('default')).toBe('default');
    });

    it('falls back to the default for unknown or non-string inputs', () => {
      expect(service.resolveTemplateId('unknown')).toBe('default');
      expect(service.resolveTemplateId(undefined)).toBe('default');
      expect(service.resolveTemplateId(123)).toBe('default');
      expect(service.resolveTemplateId(null)).toBe('default');
    });
  });

  describe('buildStudentCertificateRequest', () => {
    const student = {
      id: 42,
      user: { firstName: 'John', lastName: 'Doe', githubId: 'john' },
      course: {
        name: 'JS 2026',
        primarySkillName: 'JavaScript',
        certificateIssuer: 'RS School',
        discipline: { name: 'JS / FE' },
      },
    };

    it('returns null when no matching student is found', async () => {
      studentRepository.findOne.mockResolvedValue(null);

      const result = await service.buildStudentCertificateRequest(5, 'john');

      expect(result).toBeNull();
    });

    it('uses the discipline name as the primary skill when present', async () => {
      studentRepository.findOne.mockResolvedValue(student);

      const result = await service.buildStudentCertificateRequest(5, 'john', 'bootcamp_13_weeks');

      expect(result).toMatchObject({
        courseId: 5,
        courseName: 'JS 2026',
        coursePrimarySkill: 'JS / FE',
        certificateIssuer: 'RS School',
        studentId: 42,
        studentName: 'John Doe',
        templateId: 'bootcamp_13_weeks',
      });
      expect(typeof result?.timestamp).toBe('number');
    });

    it('falls back to primarySkillName when discipline is missing', async () => {
      const noDiscipline = { ...student, course: { ...student.course, discipline: undefined } };
      studentRepository.findOne.mockResolvedValue(noDiscipline);

      const result = await service.buildStudentCertificateRequest(5, 'john', 'hacked');

      expect(result?.coursePrimarySkill).toBe('JavaScript');
      // unknown template id falls back to default
      expect(result?.templateId).toBe('default');
    });
  });

  describe('buildCourseCertificateRequests', () => {
    const student = {
      id: 42,
      user: { firstName: 'John', lastName: 'Doe', githubId: 'john' },
      course: {
        name: 'JS 2026',
        primarySkillName: 'JavaScript',
        certificateIssuer: 'RS School',
        discipline: { name: 'JS / FE' },
      },
    };

    const makeQb = (students: unknown[]) => {
      const qb = {
        innerJoin: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(students),
      };
      return qb;
    };

    it('short-circuits when criteria are non-empty but match no students', async () => {
      vi.spyOn(service as never, 'findStudentIdsByCriteria' as never).mockResolvedValue([] as never);

      const result = await service.buildCourseCertificateRequests(5, { criteria: { minTotalScore: 100 } });

      expect(result).toEqual({ requests: [], shortCircuit: true });
    });

    it('builds requests for the matched student ids', async () => {
      vi.spyOn(service as never, 'findStudentIdsByCriteria' as never).mockResolvedValue([42] as never);
      const qb = makeQb([student]);
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.buildCourseCertificateRequests(5, { criteria: { minTotalScore: 100 } });

      expect(qb.where).toHaveBeenCalledWith('student."id" IN (:...ids)', { ids: [42] });
      expect(result.shortCircuit).toBe(false);
      expect(result.requests).toHaveLength(1);
      expect(result.requests[0]).toMatchObject({
        studentId: 42,
        templateId: 'default',
        coursePrimarySkill: 'JS / FE',
        studentName: 'John Doe',
      });
    });

    it('falls back to primarySkillName when the matched student course has no discipline', async () => {
      vi.spyOn(service as never, 'findStudentIdsByCriteria' as never).mockResolvedValue([42] as never);
      const noDiscipline = { ...student, course: { ...student.course, discipline: undefined } };
      const qb = makeQb([noDiscipline]);
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.buildCourseCertificateRequests(5, { criteria: {} });

      expect(result.requests[0].coursePrimarySkill).toBe('JavaScript');
    });

    it('targets students without certificates when criteria are empty', async () => {
      vi.spyOn(service as never, 'findStudentIdsByCriteria' as never).mockResolvedValue([] as never);
      const qb = makeQb([]);
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.buildCourseCertificateRequests(5, { criteria: {} });

      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('student.certificate', 'certificate');
      expect(qb.where).toHaveBeenCalledWith(
        'certificate.id IS NULL AND student."courseId" = :courseId AND student."isExpelled" = false AND student."isFailed" = false',
        { courseId: 5 },
      );
      expect(result).toEqual({ requests: [], shortCircuit: false });
    });

    it('handles a fully empty data object (no criteria, no templateId)', async () => {
      vi.spyOn(service as never, 'findStudentIdsByCriteria' as never).mockResolvedValue([] as never);
      const qb = makeQb([]);
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.buildCourseCertificateRequests(5, {});

      expect(result).toEqual({ requests: [], shortCircuit: false });
    });
  });

  describe('requestCertificates', () => {
    it('posts the payload to the AWS gateway with the api key header', async () => {
      const payload = { studentId: 42 };

      await service.requestCertificates(payload);

      expect(mockPost).toHaveBeenCalledWith('https://aws.example.com/certificate', payload, {
        headers: { 'x-api-key': 'secret-key' },
      });
    });
  });

  describe('findStudentIdsByCriteria (via buildCourseCertificateRequests with courseTaskIds)', () => {
    it('returns student ids whose task + interview matches cover all required tasks', async () => {
      // Drive the real private method by NOT spying on it; mock the raw query builder.
      const selectionQb = {
        select: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        getRawMany: vi.fn().mockResolvedValue([
          { student_id: 1, tasks: [10], interviews: [20] }, // 2 of 2 => kept
          { student_id: 2, tasks: [10], interviews: [] }, // 1 of 2 => dropped
        ]),
      };
      // second builder used to materialize the selected students
      const materializeQb = {
        innerJoin: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      };
      studentRepository.createQueryBuilder.mockReturnValueOnce(selectionQb).mockReturnValueOnce(materializeQb);

      const result = await service.buildCourseCertificateRequests(5, {
        criteria: { courseTaskIds: [10, 20], minScore: 50, minTotalScore: 80 },
      });

      // Only student 1 satisfies all required tasks => non-empty studentIds => IN query path
      expect(materializeQb.where).toHaveBeenCalledWith('student."id" IN (:...ids)', { ids: [1] });
      expect(result.shortCircuit).toBe(false);
    });

    it('returns all rows when no courseTaskIds are required (tasksCount === 0)', async () => {
      const selectionQb = {
        select: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        getRawMany: vi.fn().mockResolvedValue([{ student_id: 1 }, { student_id: 2 }]),
      };
      const materializeQb = {
        innerJoin: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      };
      studentRepository.createQueryBuilder.mockReturnValueOnce(selectionQb).mockReturnValueOnce(materializeQb);

      const result = await service.buildCourseCertificateRequests(5, {
        criteria: { minTotalScore: 80 },
      });

      expect(materializeQb.where).toHaveBeenCalledWith('student."id" IN (:...ids)', { ids: [1, 2] });
      expect(result.shortCircuit).toBe(false);
    });

    it('uses the default minScore (1) when courseTaskIds are present without an explicit minScore', async () => {
      const selectionQb = {
        select: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        getRawMany: vi.fn().mockResolvedValue([{ student_id: 1, tasks: [10], interviews: [] }]),
      };
      const materializeQb = {
        innerJoin: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      };
      studentRepository.createQueryBuilder.mockReturnValueOnce(selectionQb).mockReturnValueOnce(materializeQb);

      // No minScore and no minTotalScore => task/interview join uses the `: 1` fallback
      // and the minTotalScore andWhere clause is skipped.
      const result = await service.buildCourseCertificateRequests(5, {
        criteria: { courseTaskIds: [10] },
      });

      const taskJoin = selectionQb.leftJoin.mock.calls.find(call => call[1] === 'tr');
      expect(taskJoin?.[3]).toMatchObject({ minScore: 1 });
      // minTotalScore was not provided => no totalScore andWhere clause
      expect(selectionQb.andWhere).not.toHaveBeenCalledWith('student.totalScore >= :minTotalScore', expect.anything());
      expect(result.shortCircuit).toBe(false);
    });
  });
});
