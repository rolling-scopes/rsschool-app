import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScoreService } from './score.service';

const feedbackJson = JSON.stringify({
  skills: {
    htmlCss: { level: 8 },
    common: { skillA: 6, skillB: 8 },
    dataStructures: { skillC: 4, skillD: 6 },
  },
  programmingTask: { codeWritingLevel: 6 },
});

const fixtureStudents = [
  {
    id: 1,
    rank: 3,
    totalScore: 90.5,
    isExpelled: false,
    isFailed: false,
    user: {
      id: 101,
      githubId: 'john-doe',
      firstName: ' John ',
      lastName: 'Doe',
      cityName: 'Minsk',
      countryName: 'Belarus',
      primaryEmail: 'john@primary.com',
      contactsEmail: 'john@contacts.com',
      contactsEpamEmail: 'john@epam.com',
      contactsLinkedIn: 'john-linkedin',
      contactsTelegram: 'john-telegram',
      resume: [{ uuid: 'cv-uuid-1', userId: 101 }],
    },
    mentor: {
      id: 201,
      userId: 301,
      user: { id: 301, githubId: 'mentor-mike', firstName: 'Mike', lastName: 'Mentor' },
    },
    taskResults: [
      { courseTaskId: 11, score: 50, courseTask: { id: 11, disabled: false } },
      { courseTaskId: 12, score: 40, courseTask: { id: 12, disabled: true } },
    ],
    taskInterviewResults: [
      { courseTaskId: 13, score: 7, updatedDate: '2024-01-02T00:00:00.000Z' },
      { courseTaskId: 13, score: 9, updatedDate: '2024-01-05T00:00:00.000Z' },
    ],
    stageInterviews: [
      {
        id: 31,
        courseTaskId: 14,
        isCompleted: true,
        score: null,
        stageInterviewFeedbacks: [{ json: feedbackJson, updatedDate: '2024-01-03T00:00:00.000Z' }],
      },
    ],
    certificate: { id: 41 },
  },
  {
    id: 2,
    rank: 1,
    totalScore: 0,
    isExpelled: true,
    isFailed: false,
    user: {
      id: 102,
      githubId: 'jane-roe',
      firstName: 'Jane',
      lastName: null,
      cityName: null,
      countryName: null,
      resume: [],
    },
    mentor: null,
    taskResults: [],
    taskInterviewResults: [],
    stageInterviews: [],
    certificate: null,
  },
];

const fixtureCourseTasks = [
  { id: 11, task: { name: 'HTML Basics' } },
  { id: 13, task: { name: 'Interview' } },
  { id: 14, task: { name: 'Pre-Screening' } },
  { id: 15, task: { name: 'Unsolved Task' } },
];

// htmlCss 8, common (6+8)/2=7, dataStructures (4+6)/2=5, codeWriting 6 => rating (8+7+5+6)/4*10=65
const expectedRowsFull = [
  {
    githubId: 'john-doe',
    name: 'John Doe',
    cvLink: 'https://app.rs.school/cv/cv-uuid-1',
    locationName: 'Minsk',
    countryName: 'Belarus',
    mentorGithubId: 'mentor-mike',
    totalScore: 90.5,
    isActive: true,
    contacts: {
      epamEmail: 'john@epam.com',
      email: 'john@primary.com',
      linkedIn: 'john-linkedin',
      telegram: 'john-telegram',
    },
    hasCertificate: true,
    'HTML Basics': 50,
    Interview: 9,
    'Pre-Screening': 65,
    'Unsolved Task': 0,
  },
  {
    githubId: 'jane-roe',
    name: 'Jane',
    cvLink: '',
    locationName: '',
    countryName: 'Other',
    mentorGithubId: '',
    totalScore: 0,
    isActive: false,
    contacts: {
      epamEmail: undefined,
      email: undefined,
      linkedIn: undefined,
      telegram: undefined,
    },
    hasCertificate: false,
    'HTML Basics': 0,
    Interview: 0,
    'Pre-Screening': 0,
    'Unsolved Task': 0,
  },
];

const primaryUserFields = (modelName: string) => [
  `${modelName}.id`,
  `${modelName}.firstName`,
  `${modelName}.lastName`,
  `${modelName}.githubId`,
  `${modelName}.cityName`,
  `${modelName}.countryName`,
  `${modelName}.discord`,
];

const contactsUserFields = (modelName: string) => [
  `${modelName}.primaryEmail`,
  `${modelName}.contactsPhone`,
  `${modelName}.contactsEmail`,
  `${modelName}.contactsTelegram`,
  `${modelName}.contactsLinkedIn`,
  `${modelName}.contactsSkype`,
  `${modelName}.contactsEpamEmail`,
];

function createFakeQueryBuilder(content: unknown[], methods: string[]) {
  const calls: Record<string, unknown[][]> = {};
  const qb: any = {};
  for (const method of methods) {
    qb[method] = vi.fn((...args: unknown[]) => {
      (calls[method] ??= []).push(args);
      return qb;
    });
  }
  qb.getMany = vi.fn(async () => content);
  return { qb, calls };
}

describe('ScoreService.getStudentsScoreForExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setup(content: unknown[]) {
    const { qb, calls } = createFakeQueryBuilder(content, [
      'innerJoin',
      'addSelect',
      'leftJoin',
      'where',
      'andWhere',
      'orderBy',
    ]);
    const { qb: courseTaskQb, calls: courseTaskCalls } = createFakeQueryBuilder(fixtureCourseTasks, [
      'innerJoinAndSelect',
      'where',
      'andWhere',
    ]);

    const studentRepository = { createQueryBuilder: vi.fn(() => qb) };
    const dataSource = { getRepository: vi.fn(() => ({ createQueryBuilder: vi.fn(() => courseTaskQb) })) };
    const configService = { host: 'https://app.rs.school' };

    const service = new ScoreService(
      studentRepository as never,
      {} as never,
      dataSource as never,
      configService as never,
    );
    return { service, calls, courseTaskCalls };
  }

  it('builds the export query (with contacts and certificate)', async () => {
    const { service, calls, courseTaskCalls } = setup([]);

    await service.getStudentsScoreForExport(
      11,
      { activeOnly: false, cityName: 'Minsk', 'mentor.githubId': 'mike' },
      { includeContacts: true, includeCertificate: true },
    );

    expect(calls.innerJoin).toEqual([['student.user', 'user']]);
    expect(calls.addSelect).toEqual([
      [primaryUserFields('user').concat(contactsUserFields('user'))],
      [['resume.uuid', 'resume.userId']],
      [['mentor.id', 'mentor.userId']],
      [['tr.id', 'tr.score', 'tr.courseTaskId', 'tr.studentId', 'tr.courseTask']],
      [['ct.disabled', 'ct.id']],
      [['tir.id', 'tir.score', 'tir.courseTaskId', 'tr.studentId', 'tir.updatedDate']],
      [primaryUserFields('mu')],
      [['sif.stageInterviewId', 'sif.json', 'sif.updatedDate', 'si.isCompleted', 'si.id', 'si.courseTaskId', 'si.score']],
      ['certificate.id'],
    ]);
    expect(calls.leftJoin).toEqual([
      ['student.mentor', 'mentor', 'mentor."isExpelled" = FALSE'],
      ['user.resume', 'resume'],
      ['student.taskResults', 'tr'],
      ['tr.courseTask', 'ct'],
      ['student.taskInterviewResults', 'tir'],
      ['mentor.user', 'mu'],
      ['student.stageInterviews', 'si'],
      ['si.stageInterviewFeedbacks', 'sif'],
      ['student.certificate', 'certificate'],
    ]);
    expect(calls.where).toEqual([['student."courseId" = :courseId', { courseId: 11 }]]);
    expect(calls.andWhere).toEqual([
      ['"user"."cityName" ILIKE :searchCityNameText', { searchCityNameText: '%Minsk%' }],
      ['"mu"."githubId" ILIKE :searchMentorGithubIdText', { searchMentorGithubIdText: '%mike%' }],
    ]);
    expect(calls.orderBy).toEqual([['student.rank', 'ASC']]);

    expect(courseTaskCalls.innerJoinAndSelect).toEqual([['courseTask.task', 'task']]);
    expect(courseTaskCalls.where).toEqual([['courseTask.courseId = :courseId', { courseId: 11 }]]);
    expect(courseTaskCalls.andWhere).toEqual([['courseTask.disabled = :disabled', { disabled: false }]]);
  });

  it('builds the export query without contacts/certificate and without optional filters', async () => {
    const { service, calls } = setup([]);

    await service.getStudentsScoreForExport(
      11,
      { activeOnly: false },
      { includeContacts: false, includeCertificate: false },
    );

    expect(calls.addSelect?.[0]).toEqual([primaryUserFields('user')]);
    expect(calls.addSelect).not.toContainEqual(['certificate.id']);
    expect(calls.leftJoin).not.toContainEqual(['student.certificate', 'certificate']);
    expect(calls.andWhere).toBeUndefined();
  });

  it('maps students to flat export rows (contacts + certificate included)', async () => {
    const { service } = setup(fixtureStudents);

    const rows = await service.getStudentsScoreForExport(
      11,
      { activeOnly: false },
      { includeContacts: true, includeCertificate: true },
    );

    expect(rows).toEqual(expectedRowsFull);
  });

  it('maps contacts to null and hasCertificate to undefined when options are off', async () => {
    const { service } = setup(fixtureStudents);

    const rows = await service.getStudentsScoreForExport(
      11,
      { activeOnly: false },
      { includeContacts: false, includeCertificate: false },
    );

    expect(rows.map(({ contacts, hasCertificate }) => ({ contacts, hasCertificate }))).toEqual([
      { contacts: null, hasCertificate: undefined },
      { contacts: null, hasCertificate: undefined },
    ]);
  });
});
