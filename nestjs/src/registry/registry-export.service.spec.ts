import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';

// imported for side-effect ordering: controller must load before service (circular import)
void RegistryController;

const fixtureMentorRegistries = [
  {
    id: 1,
    englishMentoring: true,
    languagesMentoring: ['en', 'ru'],
    maxStudentsLimit: 4,
    preferedCourses: ['1', '2', '99'],
    preselectedCourses: ['2'],
    preferedStudentsLocation: 'any',
    technicalMentoring: ['nodejs'],
    updatedDate: '2024-04-01T10:00:00.000Z',
    user: {
      id: 101,
      githubId: 'mentor-john',
      firstName: 'John',
      lastName: 'Doe',
      primaryEmail: 'john@example.com',
      contactsEpamEmail: 'john@epam.com',
      cityName: 'Minsk',
      mentors: [
        { id: 11, courseId: 1 },
        { id: 12, courseId: 3 },
      ],
      students: [{ id: 21, certificate: { id: 31 } }],
    },
  },
  {
    id: 2,
    englishMentoring: false,
    languagesMentoring: [],
    maxStudentsLimit: 2,
    preferedCourses: [],
    preselectedCourses: [],
    preferedStudentsLocation: '',
    technicalMentoring: [],
    updatedDate: '2024-03-15T08:00:00.000Z',
    user: {
      id: 102,
      githubId: 'mentor-jane',
      firstName: 'Jane',
      lastName: null,
      primaryEmail: null,
      contactsEpamEmail: null,
      cityName: null,
      mentors: [],
      students: [],
    },
  },
];

const fixtureCourses = [
  { id: 1, name: 'JS 2024' },
  { id: 2, name: 'React 2024' },
  { id: 3, name: 'Node 2024' },
];

// `name` for jane is 'Jane null' — the legacy template-literal quirk is locked on purpose;
// unknown course id 99 is dropped by filter(Boolean) as in legacy
const expectedExportRows = [
  {
    id: 1,
    englishMentoring: true,
    languagesMentoring: ['en', 'ru'],
    githubId: 'mentor-john',
    primaryEmail: 'john@example.com',
    contactsEpamEmail: 'john@epam.com',
    cityName: 'Minsk',
    maxStudentsLimit: 4,
    name: 'John Doe',
    preferedCourses: ['JS 2024', 'React 2024'],
    preselectedCourses: ['React 2024'],
    preferedStudentsLocation: 'any',
    technicalMentoring: ['nodejs'],
    updatedDate: '2024-04-01T10:00:00.000Z',
    courses: ['JS 2024', 'Node 2024'],
    hasCertificate: true,
  },
  {
    id: 2,
    englishMentoring: false,
    languagesMentoring: [],
    githubId: 'mentor-jane',
    primaryEmail: null,
    contactsEpamEmail: null,
    cityName: null,
    maxStudentsLimit: 2,
    name: 'Jane null',
    preferedCourses: [],
    preselectedCourses: [],
    preferedStudentsLocation: '',
    technicalMentoring: [],
    updatedDate: '2024-03-15T08:00:00.000Z',
    courses: [],
    hasCertificate: false,
  },
];

function createFakeQueryBuilder(content: unknown[]) {
  const calls: Record<string, unknown[][]> = {};
  const qb: any = {};
  for (const method of ['innerJoin', 'addSelect', 'leftJoin', 'where', 'andWhere', 'orderBy']) {
    qb[method] = vi.fn((...args: unknown[]) => {
      (calls[method] ??= []).push(args);
      return qb;
    });
  }
  qb.getMany = vi.fn(async () => content);
  return { qb, calls };
}

describe('RegistryService.getMentorRegistriesForExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setup(content: unknown[]) {
    const { qb, calls } = createFakeQueryBuilder(content);
    const mockGetAll = vi.fn().mockResolvedValue(fixtureCourses);
    const service = new RegistryService(
      { createQueryBuilder: vi.fn(() => qb) } as never,
      {} as never,
      {} as never,
      { getAll: mockGetAll } as never,
      {} as never,
    );
    return { service, calls, mockGetAll };
  }

  it('builds the prepared mentor registries query filtered by canceled = false', async () => {
    const { service, calls } = setup([]);

    await service.getMentorRegistriesForExport();

    expect(calls.innerJoin).toEqual([['mentorRegistry.user', 'user']]);
    expect(calls.addSelect).toEqual([
      [
        [
          'user.id',
          'user.firstName',
          'user.lastName',
          'user.githubId',
          'user.primaryEmail',
          'user.cityName',
          'user.contactsEpamEmail',
        ],
      ],
      [['mentor.id', 'mentor.courseId', 'student.id', 'certificate.id']],
    ]);
    expect(calls.leftJoin).toEqual([
      ['user.mentors', 'mentor'],
      ['user.students', 'student'],
      ['student.certificate', 'certificate'],
    ]);
    // property-path form of the legacy `"mentorRegistry"."updatedDate"` — same column, same order
    expect(calls.orderBy).toEqual([['mentorRegistry.updatedDate', 'DESC']]);
    expect(calls.andWhere).toEqual([['mentorRegistry.canceled = false']]);
  });

  it('transforms mentor registries to flat rows with course ids replaced by names', async () => {
    const { service, mockGetAll } = setup(fixtureMentorRegistries);

    const rows = await service.getMentorRegistriesForExport();

    expect(mockGetAll).toHaveBeenCalled();
    expect(rows).toEqual(expectedExportRows);
  });
});
