import {
  CoursesTasksApi,
  CoursesEventsApi,
  StudentsScoreApi,
  StudentsApi,
  CertificateApi,
  CoursesInterviewsApi,
  CourseTaskVerificationsApi,
  CourseMentorsApi,
  TaskDtoTypeEnum,
} from '@client/api';
import { CourseService } from './course';

vi.mock('@client/api');

const COURSE_ID = 10;

const ok = (data: unknown = undefined) => ({ data }) as never;

describe('CourseService', () => {
  let service: CourseService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CourseService(COURSE_ID);
  });

  describe('getCourseCrossCheckTasks', () => {
    it('filters tasks to crossCheck checkers and passes the status', async () => {
      vi.mocked(CoursesTasksApi.prototype.getCourseTasks).mockResolvedValueOnce(
        ok([
          { id: 1, checker: 'crossCheck' },
          { id: 2, checker: 'mentor' },
        ]),
      );

      const result = await service.getCourseCrossCheckTasks('started');

      expect(CoursesTasksApi.prototype.getCourseTasks).toHaveBeenCalledWith(COURSE_ID, 'started');
      expect(result).toEqual([{ id: 1, checker: 'crossCheck' }]);
    });
  });

  describe('getCourseTasksDetails', () => {
    it('sorts dated tasks ascending and pushes tasks without an end date last', async () => {
      vi.mocked(CoursesTasksApi.prototype.getCourseTasksDetailed).mockResolvedValueOnce(
        ok([
          { id: 'b', studentEndDate: '2023-02-01' },
          { id: 'noDate', studentEndDate: null },
          { id: 'a', studentEndDate: '2023-01-01' },
        ]),
      );

      const result = await service.getCourseTasksDetails();

      expect(result.map((t: { id: string }) => t.id)).toEqual(['a', 'b', 'noDate']);
    });

    it('treats two tasks without an end date as equal', async () => {
      vi.mocked(CoursesTasksApi.prototype.getCourseTasksDetailed).mockResolvedValueOnce(
        ok([
          { id: 'x', studentEndDate: null },
          { id: 'y', studentEndDate: undefined },
        ]),
      );

      const result = await service.getCourseTasksDetails();

      expect(result.map((t: { id: string }) => t.id)).toEqual(['x', 'y']);
    });
  });

  describe('getCourseEvents', () => {
    it('reshapes raw events into CourseEvent objects', async () => {
      vi.mocked(CoursesEventsApi.prototype.getCourseEvents).mockResolvedValueOnce(
        ok([
          {
            id: 1,
            eventId: 5,
            name: 'Lecture',
            type: 'lecture',
            description: 'desc',
            descriptionUrl: 'url',
            disciplineId: 2,
            organizer: { id: 9 },
            place: 'Online',
          },
        ]),
      );

      const [event] = await service.getCourseEvents();

      expect(CoursesEventsApi.prototype.getCourseEvents).toHaveBeenCalledWith(COURSE_ID);
      expect(event).toMatchObject({
        id: 1,
        eventId: 5,
        place: 'Online',
        organizer: { id: 9 },
        event: { id: 5, name: 'Lecture', type: 'lecture', description: 'desc', descriptionUrl: 'url', disciplineId: 2 },
      });
    });
  });

  describe('createCourseEvent', () => {
    it('maps an organizer to its id', async () => {
      vi.mocked(CoursesEventsApi.prototype.createCourseEvent).mockResolvedValueOnce(ok());

      await service.createCourseEvent({ organizer: { id: 3 }, name: 'E' } as never);

      expect(CoursesEventsApi.prototype.createCourseEvent).toHaveBeenCalledWith(COURSE_ID, {
        organizer: { id: 3 },
        name: 'E',
      });
    });

    it('passes undefined organizer when none is provided', async () => {
      vi.mocked(CoursesEventsApi.prototype.createCourseEvent).mockResolvedValueOnce(ok());

      await service.createCourseEvent({ name: 'E' } as never);

      expect(CoursesEventsApi.prototype.createCourseEvent).toHaveBeenCalledWith(COURSE_ID, {
        organizer: undefined,
        name: 'E',
      });
    });
  });

  describe('updateCourseEvent', () => {
    it('maps an organizer to its id', async () => {
      vi.mocked(CoursesEventsApi.prototype.updateCourseEvent).mockResolvedValueOnce(ok());

      await service.updateCourseEvent(7, { organizer: { id: 4 }, place: 'X' } as never);

      expect(CoursesEventsApi.prototype.updateCourseEvent).toHaveBeenCalledWith(COURSE_ID, 7, {
        organizer: { id: 4 },
        place: 'X',
      });
    });

    it('passes undefined organizer when none is provided', async () => {
      vi.mocked(CoursesEventsApi.prototype.updateCourseEvent).mockResolvedValueOnce(ok());

      await service.updateCourseEvent(7, { place: 'X' } as never);

      expect(CoursesEventsApi.prototype.updateCourseEvent).toHaveBeenCalledWith(COURSE_ID, 7, {
        organizer: undefined,
        place: 'X',
      });
    });
  });

  it('deleteCourseEvent passes courseTaskId then courseId', async () => {
    vi.mocked(CoursesEventsApi.prototype.deleteCourseEvent).mockResolvedValueOnce(ok());
    await service.deleteCourseEvent(99);
    expect(CoursesEventsApi.prototype.deleteCourseEvent).toHaveBeenCalledWith(99, COURSE_ID);
  });

  describe('getCourseStudentsWithDetails', () => {
    it('requests active students when activeOnly is true', async () => {
      vi.mocked(StudentsApi.prototype.getCourseStudentsWithDetails).mockResolvedValueOnce(ok([{ id: 1 }]));
      const result = await service.getCourseStudentsWithDetails(true);
      expect(StudentsApi.prototype.getCourseStudentsWithDetails).toHaveBeenCalledWith(COURSE_ID, 'active');
      expect(result).toEqual([{ id: 1 }]);
    });

    it('requests all students when activeOnly is falsy', async () => {
      vi.mocked(StudentsApi.prototype.getCourseStudentsWithDetails).mockResolvedValueOnce(ok([]));
      await service.getCourseStudentsWithDetails();
      expect(StudentsApi.prototype.getCourseStudentsWithDetails).toHaveBeenCalledWith(COURSE_ID, 'all');
    });
  });

  describe('searchStudents', () => {
    it('returns an empty array for a null/empty query without calling the api', async () => {
      const result = await service.searchStudents(null);
      expect(result).toEqual([]);
      expect(StudentsApi.prototype.searchCourseStudents).not.toHaveBeenCalled();
    });

    it('searches and defaults onlyStudentsWithoutMentorShown to false', async () => {
      vi.mocked(StudentsApi.prototype.searchCourseStudents).mockResolvedValueOnce(ok([{ id: 1 }]));
      const result = await service.searchStudents('john');
      expect(StudentsApi.prototype.searchCourseStudents).toHaveBeenCalledWith(COURSE_ID, 'john', 'false');
      expect(result).toEqual([{ id: 1 }]);
    });

    it('passes the onlyStudentsWithoutMentorShown flag as string', async () => {
      vi.mocked(StudentsApi.prototype.searchCourseStudents).mockResolvedValueOnce(ok([]));
      await service.searchStudents('john', true);
      expect(StudentsApi.prototype.searchCourseStudents).toHaveBeenCalledWith(COURSE_ID, 'john', 'true');
    });

    it('returns an empty array when the api throws', async () => {
      vi.mocked(StudentsApi.prototype.searchCourseStudents).mockRejectedValueOnce(new Error('x'));
      const result = await service.searchStudents('john');
      expect(result).toEqual([]);
    });
  });

  describe('getCourseScore', () => {
    it('maps pagination/order/filter and trims optional query strings', async () => {
      vi.mocked(StudentsScoreApi.prototype.getScore).mockResolvedValueOnce(ok({ content: [] }));

      await service.getCourseScore(
        { current: 2, pageSize: 50 } as never,
        {
          activeOnly: true,
          githubId: ' gh ',
          name: ' name ',
          'mentor.githubId': ' mgh ',
          cityName: ' city ',
        } as never,
        { field: 'totalScore', order: 'ascend' },
      );

      expect(StudentsScoreApi.prototype.getScore).toHaveBeenCalledWith(
        'true',
        'totalScore',
        'asc',
        '2',
        '50',
        COURSE_ID,
        'gh',
        'name',
        'mgh',
        'city',
      );
    });

    it('uses descending order and default filter/order', async () => {
      vi.mocked(StudentsScoreApi.prototype.getScore).mockResolvedValueOnce(ok({ content: [] }));

      await service.getCourseScore({ current: 1, pageSize: 10 } as never);

      expect(StudentsScoreApi.prototype.getScore).toHaveBeenCalledWith(
        'false',
        'totalScore',
        'desc',
        '1',
        '10',
        COURSE_ID,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });
  });

  it('getStudentCourseScore delegates to getStudentScore', async () => {
    vi.mocked(StudentsScoreApi.prototype.getStudentScore).mockResolvedValueOnce(ok({ totalScore: 1 }));
    const result = await service.getStudentCourseScore('gh');
    expect(StudentsScoreApi.prototype.getStudentScore).toHaveBeenCalledWith(COURSE_ID, 'gh');
    expect(result).toEqual({ totalScore: 1 });
  });

  it('postStudentScore creates a single score', async () => {
    vi.mocked(StudentsScoreApi.prototype.createSingleScore).mockResolvedValueOnce(ok());
    await service.postStudentScore('gh', 3, { score: 10 });
    expect(StudentsScoreApi.prototype.createSingleScore).toHaveBeenCalledWith(COURSE_ID, 3, 'gh', { score: 10 });
  });

  it('postMultipleScores creates multiple scores and returns data', async () => {
    vi.mocked(StudentsScoreApi.prototype.createMultipleScores).mockResolvedValueOnce(ok({ updated: 2 }));
    const result = await service.postMultipleScores(3, [{ score: 1 }]);
    expect(StudentsScoreApi.prototype.createMultipleScores).toHaveBeenCalledWith(COURSE_ID, 3, [{ score: 1 }]);
    expect(result).toEqual({ updated: 2 });
  });

  it('getInterviewStudents fetches interviewer students', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.getInterviewerStudents).mockResolvedValueOnce(ok([{ id: 1 }]));
    const result = await service.getInterviewStudents(5);
    expect(CoursesInterviewsApi.prototype.getInterviewerStudents).toHaveBeenCalledWith(COURSE_ID, 5);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('postStudentInterviewResult creates an interview result', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.createInterviewResult).mockResolvedValueOnce(ok());
    await service.postStudentInterviewResult('gh', 5, { score: 1 });
    expect(CoursesInterviewsApi.prototype.createInterviewResult).toHaveBeenCalledWith(COURSE_ID, 5, 'gh', { score: 1 });
  });

  describe('student status updates', () => {
    it('expelStudent sets status expelled with default empty comment', async () => {
      vi.mocked(StudentsApi.prototype.updateStudentStatus).mockResolvedValue(ok());
      await service.expelStudent('gh');
      expect(StudentsApi.prototype.updateStudentStatus).toHaveBeenCalledWith(COURSE_ID, 'gh', {
        comment: '',
        status: 'expelled',
      });
    });

    it('setSelfStudy sets status self-study with provided comment', async () => {
      vi.mocked(StudentsApi.prototype.updateStudentStatus).mockResolvedValue(ok());
      await service.setSelfStudy('gh', 'reason');
      expect(StudentsApi.prototype.updateStudentStatus).toHaveBeenCalledWith(COURSE_ID, 'gh', {
        comment: 'reason',
        status: 'self-study',
      });
    });

    it('selfSetSelfStudy uses the self-update endpoint', async () => {
      vi.mocked(StudentsApi.prototype.selfUpdateStudentStatus).mockResolvedValueOnce(ok());
      await service.selfSetSelfStudy('gh');
      expect(StudentsApi.prototype.selfUpdateStudentStatus).toHaveBeenCalledWith(COURSE_ID, 'gh', {
        comment: '',
        status: 'self-study',
      });
    });

    it('restoreStudent sets status active', async () => {
      vi.mocked(StudentsApi.prototype.updateStudentStatus).mockResolvedValue(ok());
      await service.restoreStudent('gh');
      expect(StudentsApi.prototype.updateStudentStatus).toHaveBeenCalledWith(COURSE_ID, 'gh', { status: 'active' });
    });
  });

  it('expelStudents forwards criteria, options and reason', async () => {
    vi.mocked(StudentsApi.prototype.expelStudents).mockResolvedValueOnce(ok());
    await service.expelStudents({ minScore: 5 }, { keepWithMentor: true }, 'reason');
    expect(StudentsApi.prototype.expelStudents).toHaveBeenCalledWith(COURSE_ID, {
      criteria: { minScore: 5 },
      options: { keepWithMentor: true },
      expellingReason: 'reason',
    });
  });

  it('postCertificateStudents forwards criteria and templateId', async () => {
    vi.mocked(CertificateApi.prototype.createCourseCertificates).mockResolvedValueOnce(ok());
    await service.postCertificateStudents({ minScore: 1 }, 'tpl');
    expect(CertificateApi.prototype.createCourseCertificates).toHaveBeenCalledWith(COURSE_ID, {
      criteria: { minScore: 1 },
      templateId: 'tpl',
    });
  });

  it('postTaskSolution creates a cross-check solution', async () => {
    vi.mocked(CoursesTasksApi.prototype.createCrossCheckSolution).mockResolvedValueOnce(ok());
    const review = [{ percentage: 1, criteriaId: 'c' }];
    const comments = [{ text: 't', criteriaId: 'c', timestamp: 1 }];
    await service.postTaskSolution('gh', 3, 'url', review, comments);
    expect(CoursesTasksApi.prototype.createCrossCheckSolution).toHaveBeenCalledWith(COURSE_ID, 3, 'gh', {
      url: 'url',
      review,
      comments,
    });
  });

  it('deleteTaskSolution deletes a cross-check solution', async () => {
    vi.mocked(CoursesTasksApi.prototype.deleteCrossCheckSolution).mockResolvedValueOnce(ok());
    await service.deleteTaskSolution('gh', 3);
    expect(CoursesTasksApi.prototype.deleteCrossCheckSolution).toHaveBeenCalledWith(COURSE_ID, 3, 'gh');
  });

  it('getCrossCheckTaskSolution returns the solution', async () => {
    vi.mocked(CoursesTasksApi.prototype.getCrossCheckTaskSolution).mockResolvedValueOnce(ok({ url: 'u' }));
    const result = await service.getCrossCheckTaskSolution('gh', 3);
    expect(result).toEqual({ url: 'u' });
  });

  it('postTaskSolutionResult creates a cross-check result', async () => {
    vi.mocked(CoursesTasksApi.prototype.createCrossCheckResult).mockResolvedValueOnce(ok());
    const data = { score: 1, comment: '', anonymous: false, review: [], comments: [], criteria: [] };
    await service.postTaskSolutionResult('gh', 3, data);
    expect(CoursesTasksApi.prototype.createCrossCheckResult).toHaveBeenCalledWith(COURSE_ID, 3, 'gh', data);
  });

  describe('getTaskSolutionResult', () => {
    it('returns the result data', async () => {
      vi.mocked(CoursesTasksApi.prototype.getCrossCheckTaskResult).mockResolvedValueOnce(ok({ id: 1 }));
      const result = await service.getTaskSolutionResult('gh', 3);
      expect(result).toEqual({ id: 1 });
    });

    it('returns null when the api returns no data', async () => {
      vi.mocked(CoursesTasksApi.prototype.getCrossCheckTaskResult).mockResolvedValueOnce(ok(undefined));
      const result = await service.getTaskSolutionResult('gh', 3);
      expect(result).toBeNull();
    });
  });

  it('postTaskSolutionResultMessages creates a cross-check message', async () => {
    vi.mocked(CoursesTasksApi.prototype.createCrossCheckMessage).mockResolvedValueOnce(ok());
    await service.postTaskSolutionResultMessages(2, 3, { content: 'hi', role: 'student' });
    expect(CoursesTasksApi.prototype.createCrossCheckMessage).toHaveBeenCalledWith(COURSE_ID, 3, 2, {
      content: 'hi',
      role: 'student',
    });
  });

  it('updateTaskSolutionResultMessages updates a cross-check message', async () => {
    vi.mocked(CoursesTasksApi.prototype.updateCrossCheckMessage).mockResolvedValueOnce(ok());
    await service.updateTaskSolutionResultMessages(2, 3, { role: 'student' });
    expect(CoursesTasksApi.prototype.updateCrossCheckMessage).toHaveBeenCalledWith(COURSE_ID, 3, 2, {
      role: 'student',
    });
  });

  it('getCrossCheckTaskDetails returns details', async () => {
    vi.mocked(CoursesTasksApi.prototype.getCrossCheckTaskDetails).mockResolvedValueOnce(ok({ criteria: [] }));
    const result = await service.getCrossCheckTaskDetails(3);
    expect(result).toEqual({ criteria: [] });
  });

  it('getTaskVerifications returns verifications', async () => {
    vi.mocked(CourseTaskVerificationsApi.prototype.getStudentTaskVerifications).mockResolvedValueOnce(ok([{ id: 1 }]));
    const result = await service.getTaskVerifications();
    expect(CourseTaskVerificationsApi.prototype.getStudentTaskVerifications).toHaveBeenCalledWith(COURSE_ID);
    expect(result).toEqual([{ id: 1 }]);
  });

  it('getStageInterviews returns interviews', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.getStageInterviews).mockResolvedValueOnce(ok([{ id: 1 }]));
    const result = await service.getStageInterviews();
    expect(result).toEqual([{ id: 1 }]);
  });

  it('createStageInterviews forwards params and returns data', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.createStageInterviews).mockResolvedValueOnce(ok({ created: 1 }));
    const result = await service.createStageInterviews({ noRegistration: true });
    expect(CoursesInterviewsApi.prototype.createStageInterviews).toHaveBeenCalledWith(COURSE_ID, {
      noRegistration: true,
    });
    expect(result).toEqual({ created: 1 });
  });

  it('createInterview creates a stage interview pair', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.createStageInterviewPair).mockResolvedValueOnce(ok({ id: 1 }));
    const result = await service.createInterview('student', 'mentor');
    expect(CoursesInterviewsApi.prototype.createStageInterviewPair).toHaveBeenCalledWith(
      COURSE_ID,
      'mentor',
      'student',
    );
    expect(result).toEqual({ id: 1 });
  });

  it('updateMentoringAvailability updates availability', async () => {
    vi.mocked(StudentsApi.prototype.updateMentoringAvailability).mockResolvedValueOnce(ok());
    await service.updateMentoringAvailability('gh', true);
    expect(StudentsApi.prototype.updateMentoringAvailability).toHaveBeenCalledWith(COURSE_ID, 'gh', {
      mentoring: true,
    });
  });

  it('deleteStageInterview cancels a stage interview pair', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.cancelStageInterviewPair).mockResolvedValueOnce(ok({ ok: true }));
    const result = await service.deleteStageInterview(2);
    expect(CoursesInterviewsApi.prototype.cancelStageInterviewPair).toHaveBeenCalledWith(COURSE_ID, 2);
    expect(result).toEqual({ ok: true });
  });

  it('updateStageInterview updates a stage interview pair', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.updateStageInterviewPair).mockResolvedValueOnce(ok({ ok: true }));
    const result = await service.updateStageInterview(2, { githubId: 'gh' });
    expect(CoursesInterviewsApi.prototype.updateStageInterviewPair).toHaveBeenCalledWith(COURSE_ID, 2, {
      githubId: 'gh',
    });
    expect(result).toEqual({ ok: true });
  });

  it('getInterviewerStageInterviews returns interviewer students', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.getStageInterviewerStudents).mockResolvedValueOnce(ok([{ id: 1 }]));
    const result = await service.getInterviewerStageInterviews('gh');
    expect(result).toEqual([{ id: 1 }]);
  });

  it('postStageInterviewFeedback creates feedback with version 0', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.createInterviewFeedback).mockResolvedValueOnce(ok());
    await service.postStageInterviewFeedback(2, {
      json: { a: 1 },
      githubId: 'gh',
      isGoodCandidate: true,
      isCompleted: false,
      decision: 'yes',
    });
    expect(CoursesInterviewsApi.prototype.createInterviewFeedback).toHaveBeenCalledWith(
      COURSE_ID,
      2,
      TaskDtoTypeEnum.StageInterview,
      { version: 0, json: { a: 1 }, decision: 'yes', isGoodCandidate: true, isCompleted: false },
    );
  });

  describe('getStageInterviewFeedback', () => {
    it('returns the feedback json', async () => {
      vi.mocked(CoursesInterviewsApi.prototype.getInterviewFeedback).mockResolvedValueOnce(ok({ json: { a: 1 } }));
      const result = await service.getStageInterviewFeedback(2);
      expect(result).toEqual({ a: 1 });
    });

    it('returns an empty object when json is missing', async () => {
      vi.mocked(CoursesInterviewsApi.prototype.getInterviewFeedback).mockResolvedValueOnce(ok({}));
      const result = await service.getStageInterviewFeedback(2);
      expect(result).toEqual({});
    });
  });

  it('expelMentor expels a mentor', async () => {
    vi.mocked(CourseMentorsApi.prototype.expelMentor).mockResolvedValueOnce(ok());
    await service.expelMentor('gh');
    expect(CourseMentorsApi.prototype.expelMentor).toHaveBeenCalledWith(COURSE_ID, 'gh');
  });

  it('restoreMentor restores a mentor', async () => {
    vi.mocked(CourseMentorsApi.prototype.restoreMentor).mockResolvedValueOnce(ok());
    await service.restoreMentor('gh');
    expect(CourseMentorsApi.prototype.restoreMentor).toHaveBeenCalledWith(COURSE_ID, 'gh');
  });

  it('getCrossCheckAssignments returns assignments', async () => {
    vi.mocked(CoursesTasksApi.prototype.getCrossCheckAssignments).mockResolvedValueOnce(ok([{ url: 'u' }]));
    const result = await service.getCrossCheckAssignments('gh', 3);
    expect(result).toEqual([{ url: 'u' }]);
  });

  it('createCrossCheckDistribution wraps result data in a legacy envelope', async () => {
    vi.mocked(CoursesTasksApi.prototype.createCrossCheckDistribution).mockResolvedValueOnce(
      ok({ crossCheckPairs: [1] }),
    );
    const result = await service.createCrossCheckDistribution(3);
    expect(result).toEqual({ data: { crossCheckPairs: [1] } });
  });

  it('createInterviewDistribution distributes interview pairs', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.distributeInterviewPairs).mockResolvedValueOnce(ok({ pairs: 1 }));
    const result = await service.createInterviewDistribution(3);
    expect(CoursesInterviewsApi.prototype.distributeInterviewPairs).toHaveBeenCalledWith(COURSE_ID, 3, {
      clean: false,
      registrationEnabled: true,
    });
    expect(result).toEqual({ pairs: 1 });
  });

  it('createTaskDistribution distributes tasks', async () => {
    vi.mocked(CoursesTasksApi.prototype.createTaskDistribution).mockResolvedValueOnce(ok({ ok: true }));
    const result = await service.createTaskDistribution(3);
    expect(CoursesTasksApi.prototype.createTaskDistribution).toHaveBeenCalledWith(COURSE_ID, 3, {});
    expect(result).toEqual({ ok: true });
  });

  it('createCrossCheckCompletion completes cross-check', async () => {
    vi.mocked(CoursesTasksApi.prototype.createCrossCheckCompletion).mockResolvedValueOnce(ok({ ok: true }));
    const result = await service.createCrossCheckCompletion(3);
    expect(result).toEqual({ ok: true });
  });

  it('getStudentSummary returns the summary', async () => {
    vi.mocked(StudentsApi.prototype.getStudentSummary).mockResolvedValueOnce(ok({ totalScore: 1 }));
    const result = await service.getStudentSummary('gh');
    expect(result).toEqual({ totalScore: 1 });
  });

  it('getStudentInterviews returns interviews', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.getStudentInterviews).mockResolvedValueOnce(ok([{ id: 1 }]));
    const result = await service.getStudentInterviews('gh');
    expect(result).toEqual([{ id: 1 }]);
  });

  it('createCertificate creates a student certificate', async () => {
    vi.mocked(CertificateApi.prototype.createStudentCertificate).mockResolvedValueOnce(ok({ id: 1 }));
    const result = await service.createCertificate('gh', 'tpl');
    expect(CertificateApi.prototype.createStudentCertificate).toHaveBeenCalledWith(COURSE_ID, 'gh', {
      templateId: 'tpl',
    });
    expect(result).toEqual({ id: 1 });
  });

  it('removeCertificate removes a certificate', async () => {
    vi.mocked(CertificateApi.prototype.removeCertificate).mockResolvedValueOnce(ok());
    await service.removeCertificate(5);
    expect(CertificateApi.prototype.removeCertificate).toHaveBeenCalledWith(5);
  });

  it('getMentorInterviews returns mentor interviews', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.getMentorInterviews).mockResolvedValueOnce(ok([{ id: 1 }]));
    const result = await service.getMentorInterviews('gh');
    expect(result).toEqual([{ id: 1 }]);
  });

  it('createMentor creates a mentor', async () => {
    vi.mocked(CourseMentorsApi.prototype.createMentor).mockResolvedValueOnce(ok());
    const data = { students: [1], maxStudentsLimit: 3, preferedStudentsLocation: 'any' as never };
    await service.createMentor('gh', data);
    expect(CourseMentorsApi.prototype.createMentor).toHaveBeenCalledWith(COURSE_ID, 'gh', data);
  });

  it('updateStudent updates a student and returns data', async () => {
    vi.mocked(StudentsApi.prototype.updateStudent).mockResolvedValue(ok({ id: 1 }));
    const result = await service.updateStudent('gh', { mentorGithuId: 'm' });
    expect(StudentsApi.prototype.updateStudent).toHaveBeenCalledWith(COURSE_ID, 'gh', { mentorGithuId: 'm' });
    expect(result).toEqual({ id: 1 });
  });

  it('unassignStudentFromMentor updates a student', async () => {
    vi.mocked(StudentsApi.prototype.updateStudent).mockResolvedValue(ok({ id: 1 }));
    const result = await service.unassignStudentFromMentor('gh', { mentorGithuId: null, unassigningComment: 'c' });
    expect(StudentsApi.prototype.updateStudent).toHaveBeenCalledWith(COURSE_ID, 'gh', {
      mentorGithuId: null,
      unassigningComment: 'c',
    });
    expect(result).toEqual({ id: 1 });
  });

  it('getInterviewStudent returns the registration', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.getInterviewRegistration).mockResolvedValueOnce(ok({ id: 1 }));
    const result = await service.getInterviewStudent('gh', '5');
    expect(CoursesInterviewsApi.prototype.getInterviewRegistration).toHaveBeenCalledWith(COURSE_ID, '5');
    expect(result).toEqual({ id: 1 });
  });

  it('cancelInterviewPair converts ids to numbers', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.cancelInterviewPair).mockResolvedValueOnce(ok({ ok: true }));
    const result = await service.cancelInterviewPair('5', '6');
    expect(CoursesInterviewsApi.prototype.cancelInterviewPair).toHaveBeenCalledWith(COURSE_ID, 5, 6);
    expect(result).toEqual({ ok: true });
  });

  it('addInterviewPair adds an interview pair', async () => {
    vi.mocked(CoursesInterviewsApi.prototype.addInterviewPair).mockResolvedValueOnce(ok({ id: '1' }));
    const result = await service.addInterviewPair('5', 'interviewer', 'student');
    expect(CoursesInterviewsApi.prototype.addInterviewPair).toHaveBeenCalledWith(
      COURSE_ID,
      5,
      'interviewer',
      'student',
    );
    expect(result).toEqual({ id: '1' });
  });

  describe('exportStudentsCsv', () => {
    let openSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    });

    afterEach(() => {
      openSpy.mockRestore();
    });

    it('opens the active-students csv url when activeOnly is true', () => {
      service.exportStudentsCsv(true);
      expect(openSpy).toHaveBeenCalledWith(`/api/v2/courses/${COURSE_ID}/students/csv?status=active`, '_blank');
    });

    it('opens the all-students csv url when activeOnly is falsy', () => {
      service.exportStudentsCsv();
      expect(openSpy).toHaveBeenCalledWith(`/api/v2/courses/${COURSE_ID}/students/csv?status=`, '_blank');
    });
  });
});
