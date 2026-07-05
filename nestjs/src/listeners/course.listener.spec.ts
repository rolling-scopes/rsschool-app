import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { Course } from '@entities/course';
import { MoreThanOrEqual, Not } from 'typeorm';
import { ExportCourseDto } from 'src/courses/dto';
import { ConfigService } from '../config';
import { CourseListener } from './course.listener';

// Mock the AWS SDK so the S3 client constructed in the listener ctor is inert
// and we control getObject/putObject.
const mockGetObject = vi.fn();
const mockPutObject = vi.fn();
vi.mock('@aws-sdk/client-s3', () => ({
  S3: class {
    getObject = mockGetObject;
    putObject = mockPutObject;
  },
}));

const buildCourse = (overrides: Partial<Course> = {}): Course =>
  ({
    id: 1,
    name: 'RS 2024',
    fullName: 'Rolling Scopes 2024',
    alias: 'rs2024',
    description: 'desc',
    descriptionUrl: 'http://x',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-01'),
    registrationEndDate: new Date('2024-02-01'),
    personalMentoringStartDate: null,
    personalMentoringEndDate: null,
    wearecommunityUrl: null,
    discipline: { id: 2, name: 'JS' },
    ...overrides,
  }) as Partial<Course> as Course;

describe('CourseListener', () => {
  let listener: CourseListener;
  const repository = { find: vi.fn() };
  const httpService = { post: vi.fn() };
  let config: {
    awsClient: { region: string; credentials: { accessKeyId: string; secretAccessKey: string } };
    buckets: { cdn: string };
    env: 'prod' | 'staging' | 'local';
    auth: { github: { integrationSiteToken: string } };
  };

  const buildListener = async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseListener,
        { provide: getRepositoryToken(Course), useValue: repository },
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    return module.get(CourseListener);
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    config = {
      awsClient: { region: 'eu-central-1', credentials: { accessKeyId: 'x', secretAccessKey: 'y' } },
      buckets: { cdn: 'cdn.rs.school' },
      env: 'prod',
      auth: { github: { integrationSiteToken: 'token-123' } },
    };
    listener = await buildListener();
  });

  describe('findExportCourses (via handleCoursesChange)', () => {
    it('queries only open, registration-open, non-test, non-invite-only courses with discipline', async () => {
      repository.find.mockResolvedValue([]);
      // env is prod but stored===serialized → no S3 write, no trigger
      mockGetObject.mockResolvedValue({ Body: { transformToString: () => Promise.resolve('[]') } });

      await listener.handleCoursesChange();

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          completed: false,
          registrationEndDate: MoreThanOrEqual(expect.any(Date)),
          alias: Not('test-course'),
          inviteOnly: Not(true),
        },
        relations: ['discipline'],
      });
    });
  });

  describe('exportCoursesToS3Conditionally', () => {
    it('does not export or trigger when env is not prod', async () => {
      config.env = 'staging';
      listener = await buildListener();
      repository.find.mockResolvedValue([buildCourse()]);

      await listener.handleCoursesChange();

      expect(mockGetObject).not.toHaveBeenCalled();
      expect(mockPutObject).not.toHaveBeenCalled();
      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('writes to S3 and triggers a site update when the serialized data changed', async () => {
      const course = buildCourse();
      repository.find.mockResolvedValue([course]);
      mockGetObject.mockResolvedValue({ Body: { transformToString: () => Promise.resolve('stale') } });
      mockPutObject.mockResolvedValue({});
      httpService.post.mockReturnValue(of({ data: {} }));

      await listener.handleCoursesChange();

      expect(mockPutObject).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'cdn.rs.school',
          Key: 'app/courses.json',
          ContentType: 'application/json',
          CacheControl: 'max-age=30',
        }),
      );
      expect(httpService.post).toHaveBeenCalledWith(
        'https://api.github.com/repos/rolling-scopes/site/dispatches',
        { event_type: 'course.updated' },
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer token-123' }),
        }),
      );
    });

    it('does not write or trigger when the stored data is identical', async () => {
      const course = buildCourse();
      repository.find.mockResolvedValue([course]);
      // Stored value is exactly what the listener will serialize from ExportCourseDto(course)
      const serialized = JSON.stringify([new ExportCourseDto(course)]);
      mockGetObject.mockResolvedValue({ Body: { transformToString: () => Promise.resolve(serialized) } });

      await listener.handleCoursesChange();

      expect(mockPutObject).not.toHaveBeenCalled();
      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('treats a getObject failure as no stored data and writes + triggers', async () => {
      repository.find.mockResolvedValue([buildCourse()]);
      mockGetObject.mockRejectedValue(new Error('NoSuchKey'));
      mockPutObject.mockResolvedValue({});
      httpService.post.mockReturnValue(of({ data: {} }));

      await listener.handleCoursesChange();

      // stored is undefined !== serialized → writes
      expect(mockPutObject).toHaveBeenCalled();
      expect(httpService.post).toHaveBeenCalled();
    });
  });

  describe('triggerSiteUpdate', () => {
    it('warns and does not POST when there is no integration site token', async () => {
      config.auth.github.integrationSiteToken = '';
      listener = await buildListener();
      const warnSpy = vi.spyOn((listener as unknown as { logger: { warn: () => void } }).logger, 'warn');
      repository.find.mockResolvedValue([buildCourse()]);
      mockGetObject.mockResolvedValue({ Body: { transformToString: () => Promise.resolve('stale') } });
      mockPutObject.mockResolvedValue({});

      await listener.handleCoursesChange();

      expect(warnSpy).toHaveBeenCalledWith('No integration site token');
      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('logs an error when the dispatch request fails', async () => {
      repository.find.mockResolvedValue([buildCourse()]);
      mockGetObject.mockResolvedValue({ Body: { transformToString: () => Promise.resolve('stale') } });
      mockPutObject.mockResolvedValue({});
      httpService.post.mockReturnValue(throwError(() => new Error('dispatch failed')));
      const errorSpy = vi.spyOn((listener as unknown as { logger: { error: () => void } }).logger, 'error');

      await listener.handleCoursesChange();

      expect(errorSpy).toHaveBeenCalledWith('Error dispatching course event to the site repository', 'dispatch failed');
    });
  });
});
