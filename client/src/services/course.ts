import globalAxios, { AxiosInstance } from 'axios';
import { UserBasic, MentorBasic, StudentBasic, InterviewDetails, InterviewPair } from 'common/models';
import { ScoreOrder, ScoreTableFilters } from 'modules/Score/hooks/types';
import { IPaginationInfo } from 'common/types/pagination';
import { PreferredStudentsLocation } from 'common/enums/mentor';

import {
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
} from 'api';
import { optionalQueryString } from 'utils/optionalQueryString';

export enum CrossCheckStatus {
  Initial = 'initial',
  Distributed = 'distributed',
  Completed = 'completed',
}

export type CrossCheckCriteriaType = 'title' | 'subtask' | 'penalty';
export interface CrossCheckCriteriaData {
  key: string;
  max?: number;
  text: string;
  type: CrossCheckCriteriaType;
  point?: number;
  textComment?: string;
}

export interface CrossCheckMessageAuthor {
  id: number;
  githubId: string;
}

export type SolutionReviewType = {
  id: number;
  dateTime: number;
  comment: string;
  criteria?: CrossCheckCriteriaData[];
  author: {
    id: number;
    name: string;
    githubId: string;
    discord: Discord | null;
  } | null;
  score: number;
  messages: CrossCheckMessageDto[];
};

export type Feedback = {
  url?: string;
  reviews?: SolutionReviewType[];
};

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
  event: EventDto;
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

export interface CourseUser {
  id: number;
  name: string;
  githubId: string;
  courseId: number;
  isManager: boolean;
  isSupervisor: boolean;
  isDementor: boolean;
}

export interface MentorWithContacts {
  githubId: string;
  email: string;
  phone: string;
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

export type AllStudents = { students: StudentBasic[]; assignedStudents: AssignedStudent[] };

export type SearchStudent = UserBasic & { mentor: UserBasic | null };

const courseTasksApi = new CoursesTasksApi();
const courseEventsApi = new CoursesEventsApi();
const studentsScoreApi = new StudentsScoreApi();

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
    type Response = { data: CourseTaskDetails[] };
    const result = await this.axios.get<Response>('/tasks/details');
    return result.data.data.sort(sortTasksByEndDate);
  }

  async getCourseEvents() {
    const result = await this.axios.get<{ data: CourseEvent[] }>(`/events`);
    return result.data.data;
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

  async getCourseStudents(activeOnly?: boolean) {
    const result = await this.axios.get<{ data: StudentDetails[] }>(
      `/students?status=${activeOnly ? 'active' : 'all'}`,
    );
    return result.data.data;
  }

  async getCourseStudentsWithDetails(activeOnly?: boolean) {
    const result = await this.axios.get<{ data: StudentDetails[] }>(
      `/students/details?status=${activeOnly ? 'active' : 'all'}`,
    );
    return result.data.data;
  }

  async searchStudents(query: string | null, onlyStudentsWithoutMentorShown = false) {
    try {
      if (!query) {
        return [];
      }
      const response = await this.axios.get<{ data: SearchStudent[] }>(`/students/search/${query}`, {
        params: { onlyStudentsWithoutMentorShown },
      });
      return response.data.data;
    } catch (e) {
      return [];
    }
  }

  async searchMentors(query: string | null) {
    try {
      if (!query) {
        return [];
      }
      const response = await this.axios.get<{ data: { id: number; githubId: string; name: string }[] }>(
        `/mentors/search/${query}`,
      );
      return response.data.data;
    } catch (e) {
      return [];
    }
  }

  async getMentorsWithDetails() {
    type Response = { data: MentorDetails[] };
    const result = await this.axios.get<Response>('/mentors/details');
    return result.data.data;
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

  async postStudentScore(githubId: string, courseTaskId: number, data: PostScore) {
    await this.axios.post(`/student/${githubId}/task/${courseTaskId}/result`, data);
  }

  async postMultipleScores(courseTaskId: number, data: unknown) {
    const result = await this.axios.post(`/scores/${courseTaskId}`, data);
    return result.data.data;
  }

  async getAllMentorStudents() {
    const result = await this.axios.get<{ data: AllStudents }>(`/mentor/me/students/all`);
    return result.data.data;
  }

  async getInterviewStudents(courseTaskId: number) {
    const result = await this.axios.get<{ data: StudentBasic[] }>(`/mentor/me/interview/${courseTaskId}`);
    return result.data.data;
  }

  async postStudentInterviewResult(githubId: string, courseTaskId: number, data: unknown) {
    const result = await this.axios.post(`/student/${githubId}/interview/${courseTaskId}/result`, data);
    return result.data.data;
  }

  async postPublicFeedback(data: { toUserId: number; badgeId?: string; comment: string }) {
    type Response = { data: { heroesUrl: string } };
    const result = await this.axios.post<Response>(`/feedback`, data);
    return result.data.data;
  }

  async expelStudent(githubId: string, comment = '') {
    await this.axios.post(`/student/${githubId}/status`, { comment, status: 'expelled' });
  }

  async setSelfStudy(githubId: string, comment = '') {
    await this.axios.post(`/student/${githubId}/status`, { comment, status: 'self-study' });
  }

  async selfSetSelfStudy(githubId: string, comment = '') {
    await this.axios.post(`/student/${githubId}/status-self`, { comment, status: 'self-study' });
  }

  async expelStudents(
    criteria: { courseTaskIds?: number[]; minScore?: number },
    options: { keepWithMentor?: boolean },
    expellingReason: string,
  ) {
    await this.axios.post(`/students/status`, { criteria, options, expellingReason, status: 'expelled' });
  }

  async postCertificateStudents(criteria: { courseTaskIds?: number[]; minScore?: number; minTotalScore?: number }) {
    await this.axios.post(`/certificates`, { criteria });
  }

  async restoreStudent(githubId: string) {
    await this.axios.post(`/student/${githubId}/status`, { status: 'active' });
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
    const apiUrl = `/student/${githubId}/task/${courseTaskId}/cross-check/solution`;
    const result = await this.axios.get(apiUrl);
    return result.data.data as TaskSolution;
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
      criteria: CrossCheckCriteriaData[];
    },
  ) {
    await this.axios.post(`/student/${githubId}/task/${courseTaskId}/cross-check/result`, data);
  }

  async getTaskSolutionResult(githubId: string, courseTaskId: number) {
    const result = await this.axios.get(`/student/${githubId}/task/${courseTaskId}/cross-check/result`);
    return result.data.data as {
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
        criteria: CrossCheckCriteriaData[];
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
    const result = await this.axios.get(`/task/${courseTaskId}/cross-check/details`);
    return result.data.data as {
      criteria: CrossCheckCriteria[];
      studentEndDate: string | undefined;
    } | null;
  }

  async getTaskVerifications() {
    const result = await this.axios.get(`/student/me/tasks/verifications`);
    return result.data.data;
  }

  async getStageInterviews() {
    const result = await this.axios.get(`/interviews/stage`);
    return result.data.data;
  }

  async createStageInterviews(params: { noRegistration: boolean }) {
    const result = await this.axios.post(`/interviews/stage`, params);
    return result.data.data;
  }

  async createInterview(githubId: string, mentorGithubId: string) {
    const result = await this.axios.post(`/interview/stage/interviewer/${mentorGithubId}/student/${githubId}`);
    return result.data.data;
  }

  async updateMentoringAvailability(githubId: string, mentoring: boolean) {
    const result = await this.axios.post(`/student/${githubId}/availability`, { mentoring });
    return result.data.data;
  }

  async deleteStageInterview(interviewId: number) {
    const result = await this.axios.delete(`/interview/stage/${interviewId}`);
    return result.data.data;
  }

  async updateStageInterview(interviewId: number, data: { githubId: string }) {
    const result = await this.axios.put(`/interview/stage/${interviewId}`, data);
    return result.data.data;
  }

  async getInterviewerStageInterviews(githubId: string) {
    const result = await this.axios.get(`/interview/stage/interviewer/${githubId}/students`);
    return result.data.data as { id: number; completed: boolean; student: StudentBasic }[];
  }

  async postStageInterviews(stageId: number) {
    const result = await this.axios.post(`/stage/${stageId}/interviews`);
    return result.data.data;
  }

  async postStageInterviewFeedback(
    interviewId: number,
    data: { json: unknown; githubId: string; isGoodCandidate: boolean; isCompleted: boolean; decision: string },
  ) {
    const result = await this.axios.post(`/interview/stage/${interviewId}/feedback`, data);
    return result.data.data;
  }

  async getStageInterviewFeedback(interviewId: number) {
    const result = await this.axios.get(`/interview/stage/${interviewId}/feedback`);
    return result.data.data;
  }

  async getStageInterviewsByStudent(githubId: string) {
    const result = await this.axios.get(`/student/${githubId}/interviews`);
    return result.data.data;
  }

  async createRepository(githubId: string) {
    type Response = { data: { repository: string } };
    const result = await this.axios.post<Response>(`/student/${githubId}/repository`);
    return result.data.data;
  }

  async createRepositories() {
    const result = await this.axios.post(`/repositories`);
    return result.data.data as { repository: string }[];
  }

  async postSyncRepositoriesMentors() {
    await this.axios.post(`/repositories/mentors`);
  }

  async expelMentor(githubId: string) {
    await this.axios.post(`/mentor/${githubId}/status/expelled`);
  }

  async restoreMentor(githubId: string) {
    await this.axios.post(`/mentor/${githubId}/status/restore`);
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

  async getCrossCheckFeedback(githubId: string, courseTaskId: number) {
    const result = await this.axios.get<{ data: Feedback }>(
      `/student/${githubId}/task/${courseTaskId}/cross-check/feedback`,
    );
    return result.data.data;
  }

  async createCrossCheckDistribution(courseTaskId: number) {
    const result = await this.axios.post(`/task/${courseTaskId}/cross-check/distribution`);
    return result.data;
  }

  async createInterviewDistribution(courseTaskId: number) {
    const result = await this.axios.post(`/interviews/${courseTaskId}`);
    return result.data;
  }

  async createTaskDistribution(courseTaskId: number) {
    const result = await this.axios.post(`/task/${courseTaskId}/distribution`);
    return result.data;
  }

  async createCrossCheckCompletion(courseTaskId: number) {
    const result = await this.axios.post(`/task/${courseTaskId}/cross-check/completion`);
    return result.data;
  }

  async getUsers() {
    const result = await this.axios.get('/users');
    return result.data.data;
  }

  async upsertUsers(data: unknown) {
    const result = await this.axios.put(`/users`, data);
    return result.data;
  }

  async upsertUser(githubId: string, data: unknown) {
    const result = await this.axios.put(`/user/${githubId}`, data);
    return result.data;
  }

  async getStudentSummary(githubId: string | 'me') {
    const result = await this.axios.get(`/student/${githubId}/summary`);
    return result.data.data as StudentSummary;
  }

  async getStudentScore(githubId: string) {
    const result = await this.axios.get(`/student/${githubId}/score`);
    return result.data.data as { totalScore: number; results: { courseTaskId: number; score: number }[] };
  }

  async getStudentInterviews(githubId: string) {
    const result = await this.axios.get(`/student/${githubId}/interviews`);
    return result.data.data as InterviewDetails[];
  }

  async createCertificate(githubId: string) {
    const result = await this.axios.post(`/student/${githubId}/certificate`);
    return result.data.data;
  }

  async getMentorInterviews(githubId: string) {
    const result = await this.axios.get<{ data: MentorInterview[] }>(`/mentor/${githubId}/interviews`);
    return result.data.data;
  }

  async createMentor(
    githubId: string,
    data: { students: string[]; maxStudentsLimit: number; preferedStudentsLocation: PreferredStudentsLocation },
  ) {
    const result = await this.axios.post(`/mentor/${githubId}`, data);
    return result.data.data;
  }

  async updateStudent(githubId: string, data: { mentorGithuId: string | null }) {
    const result = await this.axios.put(`/student/${githubId}`, data);
    return result.data.data as StudentBasic;
  }

  async unassignStudentFromMentor(githubId: string, data: { mentorGithuId: null; unassigningComment: string }) {
    const result = await this.axios.put(`/student/${githubId}`, data);
    return result.data.data;
  }

  async createInterviewStudent(githubId: string, interviewId: string) {
    const result = await this.axios.post(`/student/${githubId}/interview/${interviewId}`);
    return result.data.data;
  }

  async getInterviewStudent(githubId: string, interviewId: string) {
    const result = await this.axios.get(`/student/${githubId}/interview/${interviewId}`);
    return result.data.data as { id: number } | null;
  }

  async getInterviews() {
    const result = await this.axios.get(`/interviews`);
    return result.data.data as Interview[];
  }

  async getInterviewPairs(interviewId: string) {
    const result = await this.axios.get(`/interviews/${interviewId}`);
    return result.data.data as InterviewPair[];
  }

  async cancelInterviewPair(interviewId: string, pairId: string) {
    const result = await this.axios.delete(`/interviews/${interviewId}/${pairId}`);
    return result.data.data;
  }

  async addInterviewPair(interviewId: string, interviewerGithubId: string, studentGithubId: string) {
    const result = await this.axios.post(
      `/interview/${interviewId}/interviewer/${interviewerGithubId}/student/${studentGithubId}`,
    );
    return result.data.data as { id: string };
  }

  async sendInviteRepository(githubId: string) {
    const result = await this.axios.post(`/student/${githubId}/repository`);
    return result.data.data;
  }

  exportStudentsCsv(activeOnly?: boolean) {
    window.open(`${this.axios.defaults.baseURL}/students/csv?status=${activeOnly ? 'active' : ''}`, '_blank');
  }
}

export interface Interview {
  startDate: string;
  endDate: string;
  name: string;
  id: string;
  descriptionUrl: string;
  type: string;
  template: string | null;
}

export interface AssignedStudent extends StudentBasic {
  courseTaskId: number;
}

export interface StudentDetails extends StudentBasic {
  countryName: string;
  cityName: string;
  totalScore: number;
  repository: string;
  interviews: { id: number; isCompleted: boolean }[];
}

export interface MentorDetails extends MentorBasic {
  countryName: string;
  cityName: string;
  maxStudentsLimit: number;
  studentsPreference: string;
  interviews: {
    total: number;
    completed: number;
  };
  screenings: {
    total: number;
    completed: number;
  };
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
  discord: string;
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
  repository?: string | null;
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

const sortTasksByEndDate = (a: CourseTaskDetails, b: CourseTaskDetails) => {
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
  status: number;
  student: Omit<UserBasic, 'id'>;
  id: number;
};
