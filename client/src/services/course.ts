import globalAxios, { AxiosInstance } from 'axios';
import { Event } from './event';
import { UserBasic, MentorBasic, StudentBasic, InterviewDetails, InterviewPair } from 'common/models';
import { sortTasksByEndDate } from 'services/rules';
import { TaskType } from './task';
import { ScoreTableFilters } from 'common/types/score';
import { IPaginationInfo, Pagination } from 'common/types/pagination';
import { onlyDefined } from '../utils/onlyDefined';
import { PreferredStudentsLocation } from 'common/enums/mentor';
import { CoursesTasksApi } from 'api';

export type CrossCheckStatus = 'initial' | 'distributed' | 'completed';
export type Checker = 'auto-test' | 'mentor' | 'assigned' | 'taskOwner' | 'crossCheck';

export type Feedback = {
  url?: string;
  comments?: {
    comment: string;
    author: {
      name: string;
      githubId: string;
    } | null;
    score: number;
  }[];
};

export interface CourseTask {
  id: number;
  taskId: number;
  name: string;
  maxScore: number | null;
  scoreWeight: number;
  type: TaskType;
  githubRepoName: string;
  sourceGithubRepoUrl: string;
  githubPrRequired: boolean;
  descriptionUrl: string | null;
  studentStartDate: string | null;
  studentEndDate: string | null;
  crossCheckEndDate: string | null;
  crossCheckStatus: CrossCheckStatus;
  useJury: boolean;
  checker: Checker;
  taskOwnerId: number | null;
  isVisible?: boolean;
  special?: string;
  duration?: number;
  score?: number | null;
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

export interface IColumn {
  dataIndex: string;
  title: () => JSX.Element;
  width: number;
  className: string;
  render: (_: any, d: StudentScore) => JSX.Element | 0;
  name: string;
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

export interface CourseTaskDetails extends CourseTask {
  description: string | null;
  resultsCount: number;
  taskOwner: { id: number; githubId: string; name: string } | null;
  pairsCount?: number;
}

export interface CourseEvent {
  id: number;
  event: Event;
  date?: string;
  time?: string;
  dateTime: string;
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
  isTask?: boolean;
  checker?: Checker;
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
}

export interface CreateCourseTask {
  taskId: number;
  maxScore?: number;
  scoreWeight?: number;
}

export interface MentorWithContacts {
  githubId: string;
  email: string;
  phone: string;
}

export type CrossCheckCriteria = { type: string; title?: string; text?: string; max: number; criteriaId: string };
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

export class CourseService {
  private axios: AxiosInstance;

  constructor(private courseId: number) {
    this.axios = globalAxios.create({ baseURL: `/api/course/${this.courseId}` });
  }

  async getCourseTask(taskId: string) {
    type Response = { data: CourseTaskDetails };
    const result = await this.axios.get<Response>(`/task/${taskId}`);
    return result.data.data;
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

  async getCourseTasksForSchedule() {
    type Response = { data: CourseTaskDetails[] };
    const result = await this.axios.get<Response>('/tasks/schedule');
    return result.data.data.sort(sortTasksByEndDate);
  }

  async getEventById(id: string) {
    const result = await this.axios.get<{ data: CourseEvent }>(`/event/${id}`);
    return result.data.data;
  }

  async getCourseEvents() {
    const result = await this.axios.get<{ data: CourseEvent[] }>(`/events`);
    return result.data.data;
  }

  async createCourseEvent(data: Partial<CourseEvent>) {
    const result = await this.axios.post<{ data: CourseEvent }>(`/event`, data);
    return result.data.data;
  }

  async updateCourseEvent(courseTaskId: number, data: any) {
    const result = await this.axios.put<{ data: CourseEvent }>(`/event/${courseTaskId}`, data);
    return result.data.data;
  }

  async postMultipleEntities(data: Partial<CourseTask | CourseEvent>, timeZone: string) {
    const result = await this.axios.post<{ data: Partial<CourseTask | CourseEvent> }>(
      `/schedule/csv/${timeZone.replace('/', '_')}`,
      data,
    );
    return result.data.data;
  }

  async deleteCourseEvent(courseTaskId: number) {
    const result = await this.axios.delete<any>(`/event/${courseTaskId}`);
    return result.data.data;
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

  async searchStudents(query: string | null) {
    try {
      if (!query) {
        return [];
      }
      const response = await this.axios.get<{ data: SearchStudent[] }>(`/students/search/${query}`);
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

  async createCourseTask(data: CreateCourseTask) {
    const result = await this.axios.post<{ data: CourseTask }>(`/task`, data);
    return result.data.data;
  }

  async updateCourseTask(courseTaskId: number, data: any) {
    const result = await this.axios.put<{ data: CourseTask }>(`/task/${courseTaskId}`, data);
    return result.data.data;
  }

  async deleteCourseTask(courseTaskId: number) {
    const result = await this.axios.delete<any>(`/task/${courseTaskId}`);
    return result.data.data;
  }

  async getCourseScore(
    pagination: IPaginationInfo,
    filter: ScoreTableFilters = { activeOnly: false },
    orderBy = { field: 'totalScore', direction: 'desc' },
  ) {
    const params = new URLSearchParams({
      current: String(pagination.current),
      pageSize: String(pagination.pageSize),
      orderBy: String(orderBy.field),
      orderDirection: String(orderBy.direction),
      ...(onlyDefined(filter) as object),
    });
    const result = await this.axios.get<{ data: Pagination<StudentScore> }>(`/students/score?${params.toString()}`);
    return result.data.data;
  }

  async postStudentScore(githubId: string, courseTaskId: number, data: PostScore) {
    await this.axios.post(`/student/${githubId}/task/${courseTaskId}/result`, data);
  }

  async postMultipleScores(courseTaskId: number, data: any) {
    const result = await this.axios.post<any>(`/scores/${courseTaskId}`, data);
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

  async postStudentInterviewResult(githubId: string, courseTaskId: number, data: any) {
    const result = await this.axios.post<any>(`/student/${githubId}/interview/${courseTaskId}/result`, data);
    return result.data.data;
  }

  async postPublicFeedback(data: { toUserId: number; badgeId?: string; comment: string }) {
    type Response = { data: { heroesUrl: string } };
    const result = await this.axios.post<Response>(`/feedback`, data);
    return result.data.data;
  }

  async expelStudent(githubId: string, comment: string = '') {
    await this.axios.post<any>(`/student/${githubId}/status`, { comment, status: 'expelled' });
  }
  async selfExpel(githubId: string, comment: string = '') {
    const result = await this.axios.post<any>(`/student/${githubId}/status-self`, { comment, status: 'expelled' });
    return result;
  }

  async setSelfStudy(githubId: string, comment: string = '') {
    await this.axios.post<any>(`/student/${githubId}/status`, { comment, status: 'self-study' });
  }

  async selfSetSelfStudy(githubId: string, comment: string = '') {
    await this.axios.post<any>(`/student/${githubId}/status-self`, { comment, status: 'self-study' });
  }

  async expelStudents(
    criteria: { courseTaskIds?: number[]; minScore?: number },
    options: { keepWithMentor?: boolean },
    expellingReason: string,
  ) {
    await this.axios.post<any>(`/students/status`, { criteria, options, expellingReason, status: 'expelled' });
  }

  async postCertificateStudents(criteria: { courseTaskIds?: number[]; minScore?: number; minTotalScore?: number }) {
    await this.axios.post<any>(`/certificates`, { criteria });
  }

  async restoreStudent(githubId: string) {
    await this.axios.post<any>(`/student/${githubId}/status`, { status: 'active' });
  }

  async postTaskSolution(
    githubId: string,
    courseTaskId: number,
    url: string,
    review?: CrossCheckReview[],
    comments?: CrossCheckComment[],
  ) {
    await this.axios.post<any>(`/student/${githubId}/task/${courseTaskId}/cross-check/solution`, {
      url,
      review,
      comments,
    });
  }

  async deleteTaskSolution(githubId: string, courseTaskId: number) {
    await this.axios.delete<any>(`/student/${githubId}/task/${courseTaskId}/cross-check/solution`);
  }

  async getCrossCheckTaskSolution(githubId: string, courseTaskId: number) {
    const apiUrl = `/student/${githubId}/task/${courseTaskId}/cross-check/solution`;
    const result = await this.axios.get<any>(apiUrl);
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
    },
  ) {
    await this.axios.post(`/student/${githubId}/task/${courseTaskId}/cross-check/result`, data);
  }

  async getTaskSolutionResult(githubId: string, courseTaskId: number) {
    const result = await this.axios.get<any>(`/student/${githubId}/task/${courseTaskId}/cross-check/result`);
    return result.data.data as {
      comments: CrossCheckComment[];
      review: CrossCheckReview[];
      studentId: number;
      checkerId: number;
      historicalScores: { score: number; comment: string; dateTime: number; anonymous: boolean }[];
    } | null;
  }

  async getCrossCheckTaskDetails(courseTaskId: number) {
    const result = await this.axios.get<any>(`/task/${courseTaskId}/cross-check/details`);
    return result.data.data as {
      criteria: CrossCheckCriteria[];
      studentEndDate: string | undefined;
    } | null;
  }

  async postTaskVerification(courseTaskId: number, data: any) {
    const result = await this.axios.post<any>(`/student/me/task/${courseTaskId}/verification`, data);
    return result.data.data;
  }

  async getTaskVerifications() {
    const result = await this.axios.get<any>(`/student/me/tasks/verifications`);
    return result.data.data;
  }

  async getStageInterviews() {
    const result = await this.axios.get<any>(`/interviews/stage`);
    return result.data.data;
  }

  async createStageInterviews(params: { keepReserve: boolean; noRegistration: boolean }) {
    const result = await this.axios.post<any>(`/interviews/stage`, params);
    return result.data.data;
  }

  async getAvailableStudentsForStageInterviews() {
    const result = await this.axios.get<any>(`/interviews/stage/students/available`);
    return result.data.data;
  }

  async createInterview(githubId: string, mentorGithubId: string) {
    const result = await this.axios.post<any>(`/interview/stage/interviewer/${mentorGithubId}/student/${githubId}`);
    return result.data.data;
  }

  async updateMentoringAvailability(githubId: string, mentoring: boolean) {
    const result = await this.axios.post<any>(`/student/${githubId}/availability`, { mentoring });
    return result.data.data;
  }

  async deleteStageInterview(interviewId: number) {
    const result = await this.axios.delete<any>(`/interview/stage/${interviewId}`);
    return result.data.data;
  }

  async updateStageInterview(interviewId: number, data: { githubId: string }) {
    const result = await this.axios.put<any>(`/interview/stage/${interviewId}`, data);
    return result.data.data;
  }

  async getInterviewerStageInterviews(githubId: string) {
    const result = await this.axios.get<any>(`/interview/stage/interviewer/${githubId}/students`);
    return result.data.data as { id: number; completed: boolean; student: StudentBasic }[];
  }

  async postStageInterviews(stageId: number) {
    const result = await this.axios.post<any>(`/stage/${stageId}/interviews`);
    return result.data.data;
  }

  async postStageInterviewFeedback(
    interviewId: number,
    data: { json: any; githubId: string; isGoodCandidate: boolean; isCompleted: boolean; decision: string },
  ) {
    const result = await this.axios.post<any>(`/interview/stage/${interviewId}/feedback`, data);
    return result.data.data;
  }

  async getStageInterviewFeedback(interviewId: number) {
    const result = await this.axios.get<any>(`/interview/stage/${interviewId}/feedback`);
    return result.data.data;
  }

  async getStageInterviewsByStudent(githubId: string) {
    const result = await this.axios.get<any>(`/student/${githubId}/interviews`);
    return result.data.data;
  }

  async createRepository(githubId: string) {
    type Response = { data: { repository: string } };
    const result = await this.axios.post<Response>(`/student/${githubId}/repository`);
    return result.data.data;
  }

  async createRepositories() {
    const result = await this.axios.post<any>(`/repositories`);
    return result.data.data as { repository: string }[];
  }

  async postSyncRepositoriesMentors() {
    await this.axios.post<any>(`/repositories/mentors`);
  }

  async expelMentor(githubId: string) {
    await this.axios.post<any>(`/mentor/${githubId}/status/expelled`);
  }

  async restoreMentor(githubId: string) {
    await this.axios.post<any>(`/mentor/${githubId}/status/restore`);
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
    const result = await this.axios.post<any>(`/task/${courseTaskId}/cross-check/distribution`);
    return result.data;
  }

  async createInterviewDistribution(courseTaskId: number) {
    const result = await this.axios.post<any>(`/interviews/${courseTaskId}`);
    return result.data;
  }

  async createTaskDistribution(courseTaskId: number) {
    const result = await this.axios.post<any>(`/task/${courseTaskId}/distribution`);
    return result.data;
  }

  async createCrossCheckCompletion(courseTaskId: number) {
    const result = await this.axios.post<any>(`/task/${courseTaskId}/cross-check/completion`);
    return result.data;
  }

  async getUsers() {
    const result = await this.axios.get<any>('/users');
    return result.data.data;
  }

  async upsertUsers(data: any) {
    const result = await this.axios.put<any>(`/users`, data);
    return result.data;
  }

  async upsertUser(githubId: string, data: any) {
    const result = await this.axios.put<any>(`/user/${githubId}`, data);
    return result.data;
  }

  async getStudentSummary(githubId: string | 'me') {
    const result = await this.axios.get<any>(`/student/${githubId}/summary`);
    return result.data.data as StudentSummary;
  }

  async getStudentScore(githubId: string) {
    const result = await this.axios.get<any>(`/student/${githubId}/score`);
    return result.data.data as { totalScore: number; results: { courseTaskId: number; score: number }[] };
  }

  async getStudentInterviews(githubId: string) {
    const result = await this.axios.get<any>(`/student/${githubId}/interviews`);
    return result.data.data as InterviewDetails[];
  }

  async createCertificate(githubId: string) {
    const result = await this.axios.post<any>(`/student/${githubId}/certificate`);
    return result.data.data;
  }

  async getMentorInterviews(githubId: string) {
    const result = await this.axios.get<any>(`/mentor/${githubId}/interviews`);
    return result.data.data as { name: string; endDate: string; completed: boolean; interviewer: any }[];
  }

  async createMentor(
    githubId: string,
    data: { students: string[]; maxStudentsLimit: number; preferedStudentsLocation: PreferredStudentsLocation },
  ) {
    const result = await this.axios.post<any>(`/mentor/${githubId}`, data);
    return result.data.data;
  }

  async updateStudent(githubId: string, data: { mentorGithuId: string | null }) {
    const result = await this.axios.put<any>(`/student/${githubId}`, data);
    return result.data.data as StudentBasic;
  }

  async unassignStudentFromMentor(githubId: string, data: { mentorGithuId: null; unassigningComment: string }) {
    const result = await this.axios.put<any>(`/student/${githubId}`, data);
    return result.data.data;
  }

  async createInterviewStudent(githubId: string, interviewId: string) {
    const result = await this.axios.post<any>(`/student/${githubId}/interview/${interviewId}`);
    return result.data.data;
  }

  async getInterviewStudent(githubId: string, interviewId: string) {
    const result = await this.axios.get<any>(`/student/${githubId}/interview/${interviewId}`);
    return result.data.data as { id: number } | null;
  }

  async getInterviews() {
    const result = await this.axios.get<any>(`/interviews`);
    return result.data.data as Interview[];
  }

  async getInterviewPairs(interviewId: string) {
    const result = await this.axios.get<any>(`/interviews/${interviewId}`);
    return result.data.data as InterviewPair[];
  }

  async cancelInterviewPair(interviewId: string, pairId: string) {
    const result = await this.axios.delete<any>(`/interviews/${interviewId}/${pairId}`);
    return result.data.data;
  }

  async addInterviewPair(interviewId: string, interviewerGithubId: string, studentGithubId: string) {
    const result = await this.axios.post<any>(
      `/interview/${interviewId}/interviewer/${interviewerGithubId}/student/${studentGithubId}`,
    );
    return result.data.data as { id: string };
  }

  async sendInviteRepository(githubId: string) {
    const result = await this.axios.post<any>(`/student/${githubId}/repository`);
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
}

export interface StudentProfile {
  courseId: number;
  totalScore: number;
  mentor: MentorWithContacts | null;
}

export interface AssignedStudent extends StudentBasic {
  courseTaskId: number;
}

export interface StudentScore extends StudentBasic {
  taskResults: {
    courseTaskId: number;
    score: number;
  }[];
  rank: number;
  cityName: string;
  totalScore: number;
  totalScoreChangeDate: string;
  repositoryLastActivityDate: string;
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
  results: any[];
  isActive: boolean;
  discord: string;
  mentor:
    | (MentorBasic & {
        contactsEmail?: string;
        contactsPhone?: string;
        contactsSkype?: string;
        contactsTelegram?: string;
        contactsNotes?: string;
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

export interface CrossCheckPairs {
  checker: {
    githubId: string;
    id: number;
  };
  task: {
    name: string;
    id: number;
  };
  student: {
    githubId: string;
    id: number;
  };
  url: string;
  comment: string;
  score: number;
  id: number;
}
