import globalAxios, { AxiosInstance } from 'axios';
import { UserBasic, MentorBasic, StudentBasic, InterviewDetails } from '@common/models';
import { ScoreOrder, ScoreTableFilters } from '@client/modules/Score/hooks/types';
import { IPaginationInfo } from '@client/shared/utils/pagination';

import {
  CourseTaskVerificationsApi,
  CourseMentorsApi,
  CoursesTasksApi,
  CoursesEventsApi,
  UpdateCourseEventDto,
  CreateCourseEventDto,
  StudentsScoreApi,
  Discord,
  CourseTaskDto,
  EventDto,
  CriteriaDto,
  CrossCheckMessageDto,
  CrossCheckCriteriaDataDto,
  StudentsApi,
  StudentSummaryDto,
  CertificateApi,
  CoursesInterviewsApi,
  MentorDetailsDtoStudentsPreferenceEnum,
  TaskDtoTypeEnum,
} from '@client/api';
import { optionalQueryString } from '@client/utils/optionalQueryString';
import { Decision } from '@client/data/interviews/technical-screening';
import { InterviewStatus } from '@client/domain/interview';

export type CrossCheckCriteriaType = 'title' | 'subtask' | 'penalty';

export interface CrossCheckMessageAuthor {
  id: number;
  githubId: string;
}

export interface Verification {
  id: number;
  createdDate: string;
  courseTaskId: number;
  courseTask: {
    id: number;
    task: {
      name: string;
    };
    type: string;
  };
  details: string;
  metadata: unknown[];
  score: number;
  status: string;
  studentId: number;
}

export interface SelfEducationPublicAttributes {
  maxAttemptsNumber: number;
  numberOfQuestions: number;
  tresholdPercentage: number;
  strictAttemptsMode?: boolean;
  oneAttemptPerNumberOfHours?: number;
  questions: SelfEducationQuestion[];
}

export interface SelfEducationQuestion {
  question: string;
  answers: string[];
  multiple: boolean;
  questionImage?: string;
  answersType?: 'image';
}

export interface SelfEducationQuestionWithIndex extends SelfEducationQuestion {
  index: number;
}

export interface CourseTaskDetails extends CourseTaskDto {
  description: string | null;
  resultsCount: number;
  taskOwner: { id: number; githubId: string; name: string } | null;
}

export interface CourseEvent {
  id: number;
  event: EventDto & { disciplineId: number | null };
  date?: string;
  time?: string;
  dateTime: string;
  endTime?: string;
  place: string;
  comment: string;
  eventId: number;
  owner: string;
  coordinator: string;
  organizerId: number;
  organizer: UserBasic | null;
  detailsUrl: string;
  broadcastUrl: string;
  special?: string;
  duration?: number;
  score?: string;
  done?: number;
}

export type CrossCheckCriteria = {
  type: CrossCheckCriteriaType;
  title?: string;
  text?: string;
  max: number;
  criteriaId: string;
};
export type CrossCheckReview = { percentage: number; criteriaId: string };
export type CrossCheckComment = {
  text: string;
  criteriaId: string;
  timestamp: number;
  authorId?: number;
  authorGithubId?: string;
};

export type SearchStudent = UserBasic & { mentor: UserBasic | null };

const courseTasksApi = new CoursesTasksApi();
const courseEventsApi = new CoursesEventsApi();
const studentsScoreApi = new StudentsScoreApi();
const studentsApi = new StudentsApi();
const certificateApi = new CertificateApi();
const coursesInterviewsApi = new CoursesInterviewsApi();
const courseTaskVerificationsApi = new CourseTaskVerificationsApi();
const courseMentorsApi = new CourseMentorsApi();

export class CourseService {
  private axios: AxiosInstance;

  constructor(private courseId: number) {
    this.axios = globalAxios.create({ baseURL: `/api/course/${this.courseId}` });
  }

  async getCourseCrossCheckTasks(status?: 'started' | 'inprogress' | 'finished') {
    const { data } = await courseTasksApi.getCourseTasks(this.courseId, status);
    return data.filter(t => t.checker === 'crossCheck');
  }

  async getCourseTasksDetails() {
    const { data } = await courseTasksApi.getCourseTasksDetailed(this.courseId);
    return data.sort(sortTasksByEndDate);
  }

  async getCourseEvents() {
    const { data } = await courseEventsApi.getCourseEvents(this.courseId);
    return data.map(
      ({ eventId, name, type, description, descriptionUrl, disciplineId, organizer, ...rest }) =>
        ({
          ...rest,
          eventId,
          event: { id: eventId, name, type, description, descriptionUrl, disciplineId },
          organizer,
        }) as CourseEvent,
    );
  }

  async createCourseEvent(data: CreateCourseEventDto) {
    const { organizer, ...rest } = data;
    await courseEventsApi.createCourseEvent(this.courseId, {
      organizer: organizer
        ? {
            id: organizer.id,
          }
        : undefined,
      ...rest,
    });
  }

  async updateCourseEvent(courseEventId: number, data: Partial<UpdateCourseEventDto>) {
    const { organizer, ...rest } = data;
    await courseEventsApi.updateCourseEvent(this.courseId, courseEventId, {
      organizer: organizer
        ? {
            id: organizer.id,
          }
        : undefined,
      ...rest,
    });
  }

  async deleteCourseEvent(courseTaskId: number) {
    await courseEventsApi.deleteCourseEvent(courseTaskId, this.courseId);
  }

  async getCourseStudentsWithDetails(activeOnly?: boolean) {
    const result = await studentsApi.getCourseStudentsWithDetails(this.courseId, activeOnly ? 'active' : 'all');
    return result.data as unknown as StudentDetails[];
  }

  async searchStudents(query: string | null, onlyStudentsWithoutMentorShown = false) {
    try {
      if (!query) {
        return [];
      }
      const response = await studentsApi.searchCourseStudents(
        this.courseId,
        query,
        String(onlyStudentsWithoutMentorShown),
      );
      return response.data as unknown as SearchStudent[];
    } catch {
      return [];
    }
  }

  async getCourseScore(
    pagination: IPaginationInfo,
    filter: ScoreTableFilters = { activeOnly: false },
    orderBy: ScoreOrder = { field: 'totalScore', order: 'descend' },
  ) {
    const result = await studentsScoreApi.getScore(
      String(filter.activeOnly),
      orderBy.field,
      orderBy.order === 'descend' ? 'desc' : 'asc',
      String(pagination.current),
      String(pagination.pageSize),
      this.courseId,
      optionalQueryString(filter.githubId),
      optionalQueryString(filter.name),
      optionalQueryString(filter['mentor.githubId']),
      optionalQueryString(filter.cityName),
    );
    return result.data;
  }

  async getStudentCourseScore(githubId: string) {
    const result = await studentsScoreApi.getStudentScore(this.courseId, githubId);
    return result.data;
  }

  async postStudentScore(githubId: string, courseTaskId: number, data: PostScore) {
    await studentsScoreApi.createSingleScore(this.courseId, courseTaskId, githubId, data);
  }

  async postMultipleScores(courseTaskId: number, data: unknown) {
    const result = await studentsScoreApi.createMultipleScores(this.courseId, courseTaskId, data as never);
    return result.data;
  }

  async getInterviewStudents(courseTaskId: number) {
    const result = await coursesInterviewsApi.getInterviewerStudents(this.courseId, courseTaskId);
    return result.data as unknown as StudentBasic[];
  }

  async postStudentInterviewResult(githubId: string, courseTaskId: number, data: unknown) {
    await coursesInterviewsApi.createInterviewResult(this.courseId, courseTaskId, githubId, data as never);
  }

  async expelStudent(githubId: string, comment = '') {
    await studentsApi.updateStudentStatus(this.courseId, githubId, { comment, status: 'expelled' });
  }

  async setSelfStudy(githubId: string, comment = '') {
    await studentsApi.updateStudentStatus(this.courseId, githubId, { comment, status: 'self-study' });
  }

  async selfSetSelfStudy(githubId: string, comment = '') {
    await studentsApi.selfUpdateStudentStatus(this.courseId, githubId, { comment, status: 'self-study' });
  }

  async expelStudents(
    criteria: { courseTaskIds?: number[]; minScore?: number },
    options: { keepWithMentor?: boolean },
    expellingReason: string,
  ) {
    await studentsApi.expelStudents(this.courseId, {
      criteria,
      options,
      expellingReason,
    });
  }

  async postCertificateStudents(
    criteria: { courseTaskIds?: number[]; minScore?: number; minTotalScore?: number },
    templateId?: string,
  ) {
    await certificateApi.createCourseCertificates(this.courseId, { criteria, templateId });
  }

  async restoreStudent(githubId: string) {
    await studentsApi.updateStudentStatus(this.courseId, githubId, { status: 'active' });
  }

  async postTaskSolution(
    githubId: string,
    courseTaskId: number,
    url: string,
    review?: CrossCheckReview[],
    comments?: CrossCheckComment[],
  ) {
    await this.axios.post(`/student/${githubId}/task/${courseTaskId}/cross-check/solution`, {
      url,
      review,
      comments,
    });
  }

  async deleteTaskSolution(githubId: string, courseTaskId: number) {
    await this.axios.delete(`/student/${githubId}/task/${courseTaskId}/cross-check/solution`);
  }

  async getCrossCheckTaskSolution(githubId: string, courseTaskId: number) {
    const result = await courseTasksApi.getCrossCheckTaskSolution(this.courseId, courseTaskId, githubId);
    return result.data as unknown as TaskSolution;
  }

  async postTaskSolutionResult(
    githubId: string,
    courseTaskId: number,
    data: {
      score: number;
      comment: string;
      anonymous: boolean;
      review: CrossCheckReview[];
      comments: CrossCheckComment[];
      criteria: CrossCheckCriteriaDataDto[];
    },
  ) {
    await this.axios.post(`/student/${githubId}/task/${courseTaskId}/cross-check/result`, data);
  }

  async getTaskSolutionResult(githubId: string, courseTaskId: number) {
    const result = await courseTasksApi.getCrossCheckTaskResult(this.courseId, courseTaskId, githubId);
    return (result.data || null) as {
      id: number;
      comments: CrossCheckComment[];
      review: CrossCheckReview[];
      anonymous: boolean;
      studentId: number;
      checkerId: number;
      historicalScores: {
        score: number;
        comment: string;
        dateTime: number;
        anonymous: boolean;
        criteria: CrossCheckCriteriaDataDto[];
      }[];
      author: {
        id: number;
        name: string;
        discord: Discord | null;
        githubId: string;
      };
      messages: CrossCheckMessageDto[];
    } | null;
  }

  async postTaskSolutionResultMessages(
    taskSolutionResultId: number,
    courseTaskId: number,
    data: {
      content: string;
      role: string;
    },
  ) {
    await this.axios.post(
      `/taskSolutionResult/${taskSolutionResultId}/task/${courseTaskId}/cross-check/messages`,
      data,
    );
  }

  async updateTaskSolutionResultMessages(
    taskSolutionResultId: number,
    courseTaskId: number,
    data: {
      role: string;
    },
  ) {
    await this.axios.put(`/taskSolutionResult/${taskSolutionResultId}/task/${courseTaskId}/cross-check/messages`, data);
  }

  async getCrossCheckTaskDetails(courseTaskId: number) {
    const result = await courseTasksApi.getCrossCheckTaskDetails(this.courseId, courseTaskId);
    return result.data as unknown as {
      criteria: CrossCheckCriteria[];
      studentEndDate: string | undefined;
    } | null;
  }

  async getTaskVerifications() {
    const result = await courseTaskVerificationsApi.getStudentTaskVerifications(this.courseId);
    return result.data;
  }

  async getStageInterviews() {
    const result = await coursesInterviewsApi.getStageInterviews(this.courseId);
    return result.data;
  }

  async createStageInterviews(params: { noRegistration: boolean }) {
    const result = await coursesInterviewsApi.createStageInterviews(this.courseId, params);
    return result.data;
  }

  async createInterview(githubId: string, mentorGithubId: string) {
    const result = await coursesInterviewsApi.createStageInterviewPair(this.courseId, mentorGithubId, githubId);
    return result.data;
  }

  async updateMentoringAvailability(githubId: string, mentoring: boolean) {
    await studentsApi.updateMentoringAvailability(this.courseId, githubId, { mentoring });
  }

  async deleteStageInterview(interviewId: number) {
    const result = await coursesInterviewsApi.cancelStageInterviewPair(this.courseId, interviewId);
    return result.data;
  }

  async updateStageInterview(interviewId: number, data: { githubId: string }) {
    const result = await coursesInterviewsApi.updateStageInterviewPair(this.courseId, interviewId, data);
    return result.data;
  }

  /**
   * @deprecated. should be removed after feedbacks are migrated to new template
   */
  async getInterviewerStageInterviews(_githubId: string) {
    const result = await coursesInterviewsApi.getStageInterviewerStudents(this.courseId);
    return result.data as unknown as { id: number; completed: boolean; student: StudentBasic }[];
  }

  /**
   * @deprecated. should be removed after feedbacks are migrated to new template
   */
  async postStageInterviewFeedback(
    interviewId: number,
    data: { json: unknown; githubId: string; isGoodCandidate: boolean; isCompleted: boolean; decision: string },
  ) {
    await coursesInterviewsApi.createInterviewFeedback(this.courseId, interviewId, TaskDtoTypeEnum.StageInterview, {
      version: 0,
      json: data.json as object,
      decision: data.decision,
      isGoodCandidate: data.isGoodCandidate,
      isCompleted: data.isCompleted,
    });
  }

  /**
   * @deprecated. should be removed after feedbacks are migrated to new template
   */
  async getStageInterviewFeedback(interviewId: number) {
    const { data } = await coursesInterviewsApi.getInterviewFeedback(
      this.courseId,
      interviewId,
      TaskDtoTypeEnum.StageInterview,
    );
    return (data.json ?? {}) as Record<string, unknown>;
  }

  async expelMentor(githubId: string) {
    await courseMentorsApi.expelMentor(this.courseId, githubId);
  }

  async restoreMentor(githubId: string) {
    await courseMentorsApi.restoreMentor(this.courseId, githubId);
  }

  async getCrossCheckAssignments(githubId: string, courseTaskId: number) {
    const result = await this.axios.get<{
      data: {
        student: StudentBasic;
        url: string;
      }[];
    }>(`/student/${githubId}/task/${courseTaskId}/cross-check/assignments`);
    return result.data.data;
  }

  async createCrossCheckDistribution(courseTaskId: number) {
    const result = await this.axios.post(`/task/${courseTaskId}/cross-check/distribution`);
    return result.data;
  }

  async createInterviewDistribution(courseTaskId: number) {
    const result = await coursesInterviewsApi.distributeInterviewPairs(this.courseId, courseTaskId, {
      clean: false,
      registrationEnabled: true,
    });
    return result.data;
  }

  async createTaskDistribution(courseTaskId: number) {
    const result = await courseTasksApi.createTaskDistribution(this.courseId, courseTaskId, {});
    return result.data;
  }

  async createCrossCheckCompletion(courseTaskId: number) {
    const result = await this.axios.post(`/task/${courseTaskId}/cross-check/completion`);
    return result.data;
  }

  async getStudentSummary(githubId: string) {
    const result = await studentsApi.getStudentSummary(this.courseId, githubId);
    return result.data as StudentSummaryDto;
  }

  async getStudentInterviews(_githubId: string) {
    const result = await coursesInterviewsApi.getStudentInterviews(this.courseId);
    return result.data as unknown as InterviewDetails[];
  }

  async createCertificate(githubId: string, templateId?: string) {
    const result = await certificateApi.createStudentCertificate(this.courseId, githubId, { templateId });
    return result.data;
  }

  async removeCertificate(studentId: number) {
    await certificateApi.removeCertificate(studentId);
  }

  async getMentorInterviews(_githubId: string) {
    const result = await coursesInterviewsApi.getMentorInterviews(this.courseId);
    return result.data as unknown as MentorInterview[];
  }

  async createMentor(
    githubId: string,
    data: {
      students: number[];
      maxStudentsLimit: number;
      preferedStudentsLocation: MentorDetailsDtoStudentsPreferenceEnum;
    },
  ) {
    await courseMentorsApi.createMentor(this.courseId, githubId, data);
  }

  async updateStudent(githubId: string, data: { mentorGithuId: string | null }) {
    const result = await studentsApi.updateStudent(this.courseId, githubId, data);
    return result.data as unknown as StudentBasic;
  }

  async unassignStudentFromMentor(githubId: string, data: { mentorGithuId: null; unassigningComment: string }) {
    const result = await studentsApi.updateStudent(this.courseId, githubId, data);
    return result.data;
  }

  async getInterviewStudent(_githubId: string, interviewId: string) {
    const result = await coursesInterviewsApi.getInterviewRegistration(this.courseId, interviewId);
    return result.data as unknown as { id: number } | null;
  }

  async cancelInterviewPair(interviewId: string, pairId: string) {
    const result = await coursesInterviewsApi.cancelInterviewPair(this.courseId, Number(interviewId), Number(pairId));
    return result.data;
  }

  async addInterviewPair(interviewId: string, interviewerGithubId: string, studentGithubId: string) {
    const result = await coursesInterviewsApi.addInterviewPair(
      this.courseId,
      Number(interviewId),
      interviewerGithubId,
      studentGithubId,
    );
    return result.data as unknown as { id: string };
  }

  exportStudentsCsv(activeOnly?: boolean) {
    window.open(`/api/v2/courses/${this.courseId}/students/csv?status=${activeOnly ? 'active' : ''}`, '_blank');
  }
}

export interface StudentDetails extends StudentBasic {
  countryName: string;
  cityName: string;
  totalScore: number;
  interviews: { id: number; isCompleted: boolean }[];
}

export interface PostScore {
  score: number;
  comment?: string;
  githubPrUrl?: string;
}

export interface StudentSummary {
  totalScore: number;
  results: { score: number; courseTaskId: number }[];
  isActive: boolean;
  mentor:
    | (MentorBasic & {
        contactsEmail?: string;
        contactsPhone?: string;
        contactsSkype?: string;
        contactsTelegram?: string;
        contactsNotes?: string;
        contactsWhatsApp?: string;
      })
    | null;
  rank: number;
}

export interface TaskSolution {
  url: string;
  updatedDate: string;
  id: string;
  review?: CrossCheckReview[];
  comments?: CrossCheckComment[];
  studentId: number;
}

export interface IAddCriteriaForCrossCheck {
  onCreate: (data: CriteriaDto) => void;
}

const sortTasksByEndDate = (a: Pick<CourseTaskDto, 'studentEndDate'>, b: Pick<CourseTaskDto, 'studentEndDate'>) => {
  if (!b.studentEndDate && a.studentEndDate) {
    return -1;
  }
  if (!a.studentEndDate && b.studentEndDate) {
    return 1;
  }
  if (!a.studentEndDate && !b.studentEndDate) {
    return 0;
  }
  return new Date(a.studentEndDate!).getTime() - new Date(b.studentEndDate!).getTime();
};

export type MentorInterview = {
  name: string;
  endDate: string;
  completed: boolean;
  interviewer: unknown;
  status: InterviewStatus;
  student: UserBasic;
  decision?: Decision;
  id: number;
};
