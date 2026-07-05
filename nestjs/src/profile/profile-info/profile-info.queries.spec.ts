import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProfileInfoService } from './profile-info.service';
import { Permissions } from './permissions';
import type { IUserSession } from '@entities/session';

// Mirrored from server/src/routes/profile/__test__/info.test.ts shapes to prove
// the raw-SQL aggregation/mapping logic is equivalent to the legacy implementation.

// Fluent query-builder mock. Every chainable method returns the builder; the
// terminal getRaw*/get* methods resolve to whatever the test queued.
function createQb() {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const m of ['select', 'addSelect', 'leftJoin', 'where', 'andWhere', 'orWhere', 'groupBy', 'orderBy']) {
    qb[m] = vi.fn().mockReturnValue(qb);
  }
  qb.getRawOne = vi.fn();
  qb.getRawMany = vi.fn();
  qb.getMany = vi.fn();
  qb.getOne = vi.fn();
  return qb;
}

// Builds a DataSource whose getRepository(...).createQueryBuilder(...) returns a
// fresh qb each call, and whose getRepository(...).find(...) is configurable.
function createDataSource() {
  const builders: Record<string, ReturnType<typeof createQb>> = {};
  const finds: Record<string, ReturnType<typeof vi.fn>> = {};

  const getRepository = vi.fn((entity: { name: string }) => {
    const name = entity.name;
    builders[name] = builders[name] ?? createQb();
    finds[name] = finds[name] ?? vi.fn().mockResolvedValue([]);
    return {
      createQueryBuilder: vi.fn(() => builders[name]),
      find: finds[name],
    };
  });

  return { dataSource: { getRepository } as unknown as DataSource, builders, finds, getRepository };
}

const allTrue: Permissions = {
  isProfileVisible: true,
  isAboutVisible: true,
  isEducationVisible: true,
  isEnglishVisible: true,
  isEmailVisible: true,
  isTelegramVisible: true,
  isSkypeVisible: true,
  isWhatsAppVisible: true,
  isPhoneVisible: true,
  isContactsNotesVisible: true,
  isLinkedInVisible: true,
  isPublicFeedbackVisible: true,
  isMentorStatsVisible: true,
  isStudentStatsVisible: true,
  isStageInterviewFeedbackVisible: true,
  isCoreJsFeedbackVisible: true,
  isConsentsVisible: true,
  isExpellingReasonVisible: true,
};

const allFalse: Permissions = Object.fromEntries(Object.keys(allTrue).map(k => [k, false])) as unknown as Permissions;

describe('ProfileInfoService raw queries', () => {
  let service: ProfileInfoService;
  let ds: ReturnType<typeof createDataSource>;

  beforeEach(async () => {
    ds = createDataSource();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileInfoService, { provide: DataSource, useValue: ds.dataSource }],
    }).compile();
    service = module.get(ProfileInfoService);
  });

  describe('getStudentCourses', () => {
    it('returns the raw rows', async () => {
      ds.getRepository({ name: 'User' } as never); // prime builder
      ds.builders.User.getRawMany.mockResolvedValue([{ courseId: 1 }, { courseId: 2 }]);

      const result = await service.getStudentCourses('john-doe');

      expect(result).toEqual([{ courseId: 1 }, { courseId: 2 }]);
    });

    it('returns null when the query yields a nullish result', async () => {
      ds.getRepository({ name: 'User' } as never);
      ds.builders.User.getRawMany.mockResolvedValue(null);

      const result = await service.getStudentCourses('john-doe');

      expect(result).toBeNull();
    });
  });

  describe('getMentorCourses', () => {
    it('merges registered + registry courses, dedupes, and returns the list', async () => {
      // registered mentor course ids (Mentor.getMany)
      ds.getRepository({ name: 'Mentor' } as never);
      ds.builders.Mentor.getMany.mockResolvedValue([{ courseId: 1 }]);
      // registry record (MentorRegistry.getOne)
      ds.getRepository({ name: 'MentorRegistry' } as never);
      ds.builders.MentorRegistry.getOne.mockResolvedValue({
        preferedCourses: ['2', '1'],
        technicalMentoring: ['JS'],
      });
      // disciplines + courses-by-discipline use repository.find
      ds.getRepository({ name: 'Discipline' } as never);
      ds.finds.Discipline.mockResolvedValue([{ id: 10 }]);
      ds.getRepository({ name: 'Course' } as never);
      ds.finds.Course.mockResolvedValue([{ id: 3 }]);

      const result = await service.getMentorCourses('john-doe');

      // Dedup (uniqBy) only runs within the registry list (preferred + by-discipline),
      // so the preferred "1" is deduped against the by-discipline list but NOT against
      // the registered "1". Registered courses are concatenated afterwards, so "1"
      // appears twice in the final result.
      expect(result).toEqual([{ courseId: 1 }, { courseId: 2 }, { courseId: 1 }, { courseId: 3 }]);
    });

    it('returns null when no mentor courses exist anywhere', async () => {
      ds.getRepository({ name: 'Mentor' } as never);
      ds.builders.Mentor.getMany.mockResolvedValue([]);
      ds.getRepository({ name: 'MentorRegistry' } as never);
      ds.builders.MentorRegistry.getOne.mockResolvedValue(null);
      ds.getRepository({ name: 'Discipline' } as never);
      ds.finds.Discipline.mockResolvedValue([]);
      ds.getRepository({ name: 'Course' } as never);
      ds.finds.Course.mockResolvedValue([]);

      const result = await service.getMentorCourses('john-doe');

      expect(result).toBeNull();
    });
  });

  describe('getConfigurableProfilePermissions', () => {
    it('returns the raw permissions row', async () => {
      ds.getRepository({ name: 'ProfilePermissions' } as never);
      ds.builders.ProfilePermissions.getRawOne.mockResolvedValue({ isProfileVisible: true });

      const result = await service.getConfigurableProfilePermissions('john-doe');

      expect(result).toEqual({ isProfileVisible: true });
    });

    it('falls back to an empty object when there is no row', async () => {
      ds.getRepository({ name: 'ProfilePermissions' } as never);
      ds.builders.ProfilePermissions.getRawOne.mockResolvedValue(undefined);

      const result = await service.getConfigurableProfilePermissions('john-doe');

      expect(result).toEqual({});
    });
  });

  describe('getRelationsRoles', () => {
    it('returns the raw relations row', async () => {
      ds.getRepository({ name: 'Student' } as never);
      const row = { student: 'john-doe', mentors: ['m1'] };
      ds.builders.Student.getRawOne.mockResolvedValue(row);

      const result = await service.getRelationsRoles('viewer', 'john-doe');

      expect(result).toBe(row);
    });

    it('returns null when there are no relations', async () => {
      ds.getRepository({ name: 'Student' } as never);
      ds.builders.Student.getRawOne.mockResolvedValue(undefined);

      const result = await service.getRelationsRoles('viewer', 'john-doe');

      expect(result).toBeNull();
    });
  });

  describe('getUserInfo', () => {
    const rawUser = {
      firstName: 'John',
      lastName: 'Doe',
      countryName: 'Poland',
      cityName: 'Warsaw',
      discord: null,
      languages: ['en'],
      educationHistory: [{ university: 'X' }],
      englishLevel: 'b2',
      contactsPhone: '+1',
      contactsEmail: 'john@example.com',
      epamEmail: 'john@epam.com',
      contactsTelegram: '@john',
      contactsSkype: 'john.skype',
      contactsWhatsApp: '+2',
      contactsNotes: 'note',
      contactsLinkedIn: 'in/john',
      aboutMyself: 'about',
    };

    it('returns full info with contacts when all permissions are visible', async () => {
      ds.getRepository({ name: 'User' } as never);
      ds.builders.User.getRawOne.mockResolvedValue(rawUser);

      const result = await service.getUserInfo('john-doe', allTrue);

      expect(result.generalInfo).toMatchObject({
        githubId: 'john-doe',
        name: 'John Doe',
        aboutMyself: 'about',
        englishLevel: 'b2',
        location: { countryName: 'Poland', cityName: 'Warsaw' },
        languages: ['en'],
      });
      expect(result.generalInfo.educationHistory).toEqual([{ university: 'X' }]);
      expect(result.contacts).toEqual({
        phone: '+1',
        email: 'john@example.com',
        epamEmail: 'john@epam.com',
        skype: 'john.skype',
        telegram: '@john',
        notes: 'note',
        linkedIn: 'in/john',
        whatsApp: '+2',
      });
    });

    it('omits gated fields and returns undefined contacts when nothing is visible', async () => {
      ds.getRepository({ name: 'User' } as never);
      // Simulate a query that only selected the always-present columns.
      ds.builders.User.getRawOne.mockResolvedValue({
        firstName: '',
        lastName: '',
        countryName: 'Poland',
        cityName: 'Warsaw',
        discord: null,
        languages: [],
      });

      const result = await service.getUserInfo('lonely', allFalse);

      expect(result.generalInfo.aboutMyself).toBeUndefined();
      expect(result.generalInfo.educationHistory).toBeUndefined();
      expect(result.generalInfo.englishLevel).toBeUndefined();
      // both names empty -> falls back to githubId
      expect(result.generalInfo.name).toBe('lonely');
      expect(result.generalInfo.languages).toEqual([]);
      expect(result.contacts).toBeUndefined();
    });

    it('shows contacts when only one contact permission (e.g. phone) is visible', async () => {
      ds.getRepository({ name: 'User' } as never);
      ds.builders.User.getRawOne.mockResolvedValue({
        firstName: 'John',
        lastName: 'Doe',
        countryName: null,
        cityName: null,
        discord: null,
        contactsPhone: '+1',
      });

      const result = await service.getUserInfo('john-doe', { ...allFalse, isPhoneVisible: true });

      expect(result.contacts).toMatchObject({ phone: '+1', email: null, whatsApp: null });
    });

    it('throws NotFoundException when the user row is missing', async () => {
      ds.getRepository({ name: 'User' } as never);
      ds.builders.User.getRawOne.mockResolvedValue(null);

      await expect(service.getUserInfo('ghost', allTrue)).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.getUserInfo('ghost', allTrue)).rejects.toThrow('User with githubId ghost not found');
    });
  });

  describe('getMentorStats', () => {
    it('maps aggregated mentor rows into per-course stats with students', async () => {
      ds.getRepository({ name: 'Mentor' } as never);
      ds.builders.Mentor.getRawMany.mockResolvedValue([
        {
          courseName: 'RS 2024',
          courseLocationName: 'Minsk',
          studentGithubIds: ['s1', 's2'],
          studentFirstNames: ['Anna', 'Bob'],
          studentLastNames: ['A', 'B'],
          studentIsExpelledStatuses: [false, true],
          studentTotalScores: [100, 50],
        },
      ]);

      const result = await service.getMentorStats('john-doe');

      expect(result).toEqual([
        {
          courseLocationName: 'Minsk',
          courseName: 'RS 2024',
          students: [
            { githubId: 's1', name: 'Anna A', isExpelled: false, totalScore: 100 },
            { githubId: 's2', name: 'Bob B', isExpelled: true, totalScore: 50 },
          ],
        },
      ]);
    });

    it('returns undefined students when the course has no students (first id is falsy)', async () => {
      ds.getRepository({ name: 'Mentor' } as never);
      ds.builders.Mentor.getRawMany.mockResolvedValue([
        {
          courseName: 'RS 2024',
          courseLocationName: 'Minsk',
          studentGithubIds: [null],
          studentFirstNames: [null],
          studentLastNames: [null],
          studentIsExpelledStatuses: [null],
          studentTotalScores: [null],
        },
      ]);

      const result = await service.getMentorStats('john-doe');

      expect(result).toEqual([{ courseLocationName: 'Minsk', courseName: 'RS 2024', students: undefined }]);
    });
  });

  describe('getPublicFeedback', () => {
    it('maps feedback rows including the resolved author name', async () => {
      ds.getRepository({ name: 'Feedback' } as never);
      ds.builders.Feedback.getRawMany.mockResolvedValue([
        {
          feedbackDate: '2024-01-01',
          badgeId: 'badge',
          comment: 'nice',
          fromUserFirstName: 'Jane',
          fromUserLastName: 'Roe',
          fromUserGithubId: 'jane',
        },
      ]);

      const result = await service.getPublicFeedback('john-doe');

      expect(result).toEqual([
        {
          feedbackDate: '2024-01-01',
          badgeId: 'badge',
          comment: 'nice',
          fromUser: { name: 'Jane Roe', githubId: 'jane' },
        },
      ]);
    });

    it('returns an empty array when there is no feedback', async () => {
      ds.getRepository({ name: 'Feedback' } as never);
      ds.builders.Feedback.getRawMany.mockResolvedValue([]);

      const result = await service.getPublicFeedback('john-doe');

      expect(result).toEqual([]);
    });
  });

  describe('getStageInterviewFeedback', () => {
    it('maps a modern feedback (with version) using the stored interview score', async () => {
      ds.getRepository({ name: 'StageInterview' } as never);
      ds.builders.StageInterview.getRawMany.mockResolvedValue([
        {
          feedbackVersion: 2,
          decision: 'yes',
          interviewFeedbackDate: '2024-02-01',
          interviewerFirstName: 'Max',
          interviewerLastName: 'M',
          interviewerGithubId: 'max',
          courseName: 'RS',
          courseFullName: 'RS Full',
          isGoodCandidate: true,
          interviewScore: 42,
          interviewResultJson: JSON.stringify({ some: 'feedback' }),
          maxScore: 100,
        },
      ]);

      const result = await service.getStageInterviewFeedback('john-doe');

      expect(result).toEqual([
        {
          version: 2,
          date: '2024-02-01',
          decision: 'yes',
          isGoodCandidate: true,
          courseName: 'RS',
          courseFullName: 'RS Full',
          feedback: { some: 'feedback' },
          score: 42,
          interviewer: { name: 'Max M', githubId: 'max' },
          maxScore: 100,
        },
      ]);
    });

    it('defaults a modern feedback score to 0 when interviewScore is nullish', async () => {
      ds.getRepository({ name: 'StageInterview' } as never);
      ds.builders.StageInterview.getRawMany.mockResolvedValue([
        {
          feedbackVersion: 1,
          decision: 'no',
          interviewFeedbackDate: '2024-02-01',
          interviewerFirstName: 'Max',
          interviewerLastName: 'M',
          interviewerGithubId: 'max',
          courseName: 'RS',
          courseFullName: 'RS Full',
          isGoodCandidate: false,
          interviewScore: null,
          interviewResultJson: JSON.stringify({ a: 1 }),
          maxScore: 100,
        },
      ]);

      const result = await service.getStageInterviewFeedback('john-doe');

      expect(result[0].score).toBe(0);
      expect(result[0].version).toBe(1);
    });

    it('parses a legacy feedback (no version) via the legacy ratings calculator', async () => {
      ds.getRepository({ name: 'StageInterview' } as never);
      const legacyJson = {
        english: { levelStudentOpinion: 'b1', levelMentorOpinion: 'b2' },
        programmingTask: { codeWritingLevel: 4 },
        resume: { score: 80, comment: 'good resume' },
        skills: {
          htmlCss: { level: 5 },
          common: { a: 5 },
          dataStructures: { b: 5 },
        },
      };
      ds.builders.StageInterview.getRawMany.mockResolvedValue([
        {
          feedbackVersion: null,
          decision: 'yes',
          interviewFeedbackDate: '2024-03-01',
          interviewerFirstName: 'Max',
          interviewerLastName: 'M',
          interviewerGithubId: 'max',
          courseName: 'RS',
          courseFullName: 'RS Full',
          isGoodCandidate: true,
          interviewScore: null,
          interviewResultJson: JSON.stringify(legacyJson),
          maxScore: 100,
        },
      ]);

      const result = await service.getStageInterviewFeedback('john-doe');

      expect(result[0].version).toBe(0);
      // resume.score short-circuits getInterviewRatings -> score === resume.score
      expect(result[0].score).toBe(80);
      expect(result[0].feedback).toMatchObject({
        english: 'b2',
        comment: 'good resume',
        skills: { htmlCss: 5 },
      });
    });

    it('uses the student english opinion when the mentor opinion is absent (legacy)', async () => {
      ds.getRepository({ name: 'StageInterview' } as never);
      const legacyJson = {
        english: { levelStudentOpinion: 'a2', levelMentorOpinion: '' },
        programmingTask: { codeWritingLevel: 4 },
        resume: { score: 0 },
        skills: { htmlCss: { level: 5 }, common: { a: 5 }, dataStructures: { b: 5 } },
      };
      ds.builders.StageInterview.getRawMany.mockResolvedValue([
        {
          feedbackVersion: null,
          decision: 'yes',
          interviewFeedbackDate: '2024-03-01',
          interviewerFirstName: 'Max',
          interviewerLastName: 'M',
          interviewerGithubId: 'max',
          courseName: 'RS',
          courseFullName: 'RS Full',
          isGoodCandidate: true,
          interviewScore: null,
          interviewResultJson: JSON.stringify(legacyJson),
          maxScore: 100,
        },
      ]);

      const result = await service.getStageInterviewFeedback('john-doe');

      expect(result[0].feedback).toMatchObject({ english: 'a2' });
    });
  });

  describe('getStudentStats', () => {
    const baseRow = {
      courseId: 5,
      courseName: 'RS',
      locationName: 'Minsk',
      courseFullName: 'RS Full',
      isExpelled: false,
      expellingReason: null,
      isCourseCompleted: true,
      totalScore: 100,
      mentorFirstName: 'Max',
      mentorLastName: 'M',
      mentorGithubId: 'max',
      taskMaxScores: [10, 20],
      taskScoreWeights: [1, 1],
      taskEndDates: ['2024-01-02', '2024-01-01'],
      taskNames: ['t1', 't2'],
      taskDescriptionUris: ['u1', 'u2'],
      taskGithubPrUris: ['pr1', 'pr2'],
      taskScores: [5, 15],
      taskComments: ['c1', 'c2'],
      certificateId: 'cert-1',
      rank: 3,
    };

    it('maps and orders tasks by end date, exposing expelling reason when permitted', async () => {
      ds.getRepository({ name: 'Student' } as never);
      ds.builders.Student.getRawMany.mockResolvedValue([{ ...baseRow }]);

      const result = await service.getStudentStats('john-doe', allTrue);

      expect(result).toHaveLength(1);
      const stat = result[0];
      expect(stat).toMatchObject({
        courseId: 5,
        courseName: 'RS',
        expellingReason: null,
        isSelfExpelled: undefined,
        certificateId: 'cert-1',
        rank: 3,
        mentor: { githubId: 'max', name: 'Max M' },
      });
      // tasks ordered ascending by end date: t2 (Jan 1) then t1 (Jan 2)
      expect(stat.tasks.map(t => t.name)).toEqual(['t2', 't1']);
      // endDate is stripped from the output
      expect(stat.tasks[0]).not.toHaveProperty('endDate');
    });

    it('hides the expelling reason when not permitted but still flags self-expelled', async () => {
      ds.getRepository({ name: 'Student' } as never);
      ds.builders.Student.getRawMany.mockResolvedValue([
        { ...baseRow, expellingReason: 'Self expelled from the course - bored' },
      ]);

      const result = await service.getStudentStats('john-doe', {
        ...allTrue,
        isExpellingReasonVisible: false,
      });

      expect(result[0].expellingReason).toBeUndefined();
      expect(result[0].isSelfExpelled).toBe(true);
    });

    it('includes core-js interview details when isCoreJsFeedbackVisible is true', async () => {
      ds.getRepository({ name: 'Student' } as never);
      ds.builders.Student.getRawMany.mockResolvedValue([
        {
          ...baseRow,
          taskInterviewFormAnswers: [{ q: 'a' }, null],
          taskInterviewDate: ['2024-01-03', null],
          interviewerGithubId: ['ivan', null],
          interviewerFirstName: ['Ivan', null],
          interviewerLastName: ['I', null],
        },
      ]);

      const result = await service.getStudentStats('john-doe', allTrue);

      const orderedFirst = result[0].tasks[0]; // t2 (Jan 1) — second array index, all interview data null
      const orderedSecond = result[0].tasks[1]; // t1 (Jan 2) — first array index, has interview data
      expect(orderedFirst.interviewer).toBeUndefined();
      expect(orderedSecond.interviewer).toEqual({ name: 'Ivan I', githubId: 'ivan' });
      expect(orderedSecond.interviewFormAnswers).toEqual({ q: 'a' });
      expect(orderedSecond.interviewDate).toBe('2024-01-03');
    });

    it('returns an empty array when the student has no rows', async () => {
      ds.getRepository({ name: 'Student' } as never);
      ds.builders.Student.getRawMany.mockResolvedValue([]);

      const result = await service.getStudentStats('john-doe', allFalse);

      expect(result).toEqual([]);
    });
  });

  describe('getProfileInfo branch coverage', () => {
    // These cover the orchestration branches not exercised by the existing
    // profile-info.service.spec.ts (which always mocks getRelationsRoles -> null
    // and only checks the visible-section ternaries on the truthy side).
    const session = (overrides: Partial<IUserSession> = {}) =>
      ({ id: 1, githubId: 'viewer', isAdmin: false, isHirer: false, courses: {}, ...overrides }) as IUserSession;

    function stubSections() {
      vi.spyOn(service, 'getConfigurableProfilePermissions').mockResolvedValue({});
      vi.spyOn(service, 'getUserInfo').mockResolvedValue({
        generalInfo: { githubId: 'john-doe' },
        contacts: undefined,
        discord: null,
      } as never);
      vi.spyOn(service, 'getPublicFeedback').mockResolvedValue([] as never);
      vi.spyOn(service, 'getMentorStats').mockResolvedValue([] as never);
      vi.spyOn(service, 'getStudentStats').mockResolvedValue([] as never);
      vi.spyOn(service, 'getStageInterviewFeedback').mockResolvedValue([] as never);
    }

    it('throws NotFoundException when no githubId can be resolved', async () => {
      await expect(service.getProfileInfo(session({ githubId: '' }), undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('skips student/registry course lookups when relations exist (relationsRoles truthy)', async () => {
      stubSections();
      vi.spyOn(service, 'getRelationsRoles').mockResolvedValue({
        student: 'john-doe',
        mentors: ['viewer'],
        interviewers: [],
        stageInterviewers: [],
        checkers: [],
      });
      const studentCoursesSpy = vi.spyOn(service, 'getStudentCourses').mockResolvedValue([]);
      const mentorCoursesSpy = vi.spyOn(service, 'getMentorCourses').mockResolvedValue(null);

      await service.getProfileInfo(session({ githubId: 'viewer', isAdmin: true }), 'john-doe');

      // relationsRoles truthy -> [null, null], so these are never queried
      expect(studentCoursesSpy).not.toHaveBeenCalled();
      expect(mentorCoursesSpy).not.toHaveBeenCalled();
    });

    it('leaves optional sections undefined for a non-owner whose permissions hide them', async () => {
      // A stranger with no relations and a profile marked visible-but-nothing-else.
      vi.spyOn(service, 'getConfigurableProfilePermissions').mockResolvedValue({
        isProfileVisible: { all: true },
      } as never);
      vi.spyOn(service, 'getRelationsRoles').mockResolvedValue(null);
      vi.spyOn(service, 'getStudentCourses').mockResolvedValue([]);
      vi.spyOn(service, 'getMentorCourses').mockResolvedValue(null);
      const userInfoSpy = vi.spyOn(service, 'getUserInfo').mockResolvedValue({
        generalInfo: { githubId: 'john-doe' },
        contacts: undefined,
        discord: null,
      } as never);
      const feedbackSpy = vi.spyOn(service, 'getPublicFeedback');
      const mentorStatsSpy = vi.spyOn(service, 'getMentorStats');
      const studentStatsSpy = vi.spyOn(service, 'getStudentStats');

      const result = await service.getProfileInfo(session({ githubId: 'viewer' }), 'john-doe');

      expect(userInfoSpy).toHaveBeenCalled();
      // role 'all' with only isProfileVisible -> these sections stay hidden
      expect(result.publicFeedback).toBeUndefined();
      expect(result.mentorStats).toBeUndefined();
      expect(result.studentStats).toBeUndefined();
      expect(result.stageInterviewFeedback).toBeUndefined();
      expect(feedbackSpy).not.toHaveBeenCalled();
      expect(mentorStatsSpy).not.toHaveBeenCalled();
      expect(studentStatsSpy).not.toHaveBeenCalled();
    });
  });
});
