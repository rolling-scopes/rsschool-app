import globalAxios, { AxiosInstance } from 'axios';
import { Session } from '../components/withSession';
import { Event } from './event';
import { UserBasic, MentorBasic, StudentBasic } from '../../../common/models';
import { sortTasksByEndDate } from 'services/rules';

export interface CourseTask {
  id: number;
  courseTaskId?: number;
  taskId: number;
  name: string;
  maxScore: number | null;
  verification: 'auto' | 'manual';
  type: 'jstask' | 'htmltask' | 'htmlcssacademy' | 'codewars' | 'test' | 'interview';
  githubRepoName: string;
  sourceGithubRepoUrl: string;
  scoreWeight: number;
  stageId: number;
  githubPrRequired: boolean;
  description: string | null;
  descriptionUrl: string | null;
  studentStartDate: string | null;
  studentEndDate: string | null;
  taskResultCount: number;
  useJury: boolean;
  checker: 'mentor' | 'assigned' | 'taskOwner' | 'crossCheck' | 'jury';
  taskOwner: { id: number; githubId: string; name: string } | null;
}

export interface CourseEvent {
  id: number;
  event: Event;
  date?: string;
  time?: string;
  dateTime?: string;
  place: string;
  comment: string;
  stageId: number;
  eventId: number;
  owner: string;
  coordinator: string;
  organizerId: number;
  organizer: UserBasic;
  detailsUrl: string;
  broadcastUrl: string;
}

export interface CourseUser {
  id: number;
  name: string;
  githubId: string;
  courseId: number;
  isManager: boolean;
  isJuryActivist: boolean;
  isSupervisor: boolean;
}

export interface CreateCourseTask {
  taskId: number;
  maxScore?: number;
  scoreWeight?: number;
  stageId: number;
}

export interface MentorWithContacts {
  githubId: string;
  email: string;
  phone: string;
}

export type AllStudents = { students: StudentBasic[]; assignedStudents: AssignedStudent[] };

export class CourseService {
  private axios: AxiosInstance;

  constructor(private courseId: number) {
    this.axios = globalAxios.create({ baseURL: `/api/course/${this.courseId}` });
  }

  async getCourseTasks() {
    type Response = { data: CourseTask[] };
    const result = await this.axios.get<Response>('/tasks');
    return result.data.data.sort(sortTasksByEndDate);
  }

  async getCourseTasksForTaskOwner() {
    const result = await this.axios.get<{ data: CourseTask[] }>(`/tasksTaskOwner`);
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

  async deleteCourseEvent(courseTaskId: number) {
    const result = await this.axios.delete(`/event/${courseTaskId}`);
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

  async searchCourseStudent(query: string | null) {
    try {
      if (!query) {
        return [];
      }
      const response = await this.axios.get<{ data: StudentDetails[] }>(`/students/search/${query}`);
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
    const result = await this.axios.delete(`/task/${courseTaskId}`);
    return result.data.data;
  }

  async getCourseScore(activeOnly: boolean = false) {
    const result = await this.axios.get<{ data: StudentScore[] }>(`/students/score?activeOnly=${activeOnly}`);
    return result.data.data;
  }

  async postStudentScore(githubId: string, courseTaskId: number, data: PostScore) {
    await this.axios.post(`/student/${githubId}/task/${courseTaskId}/result`, data);
  }

  async postMultipleScores(courseTaskId: number, data: any) {
    const result = await this.axios.post(`/scores/${courseTaskId}`, data);
    return result.data.data;
  }

  async getAllMentorStudents() {
    const result = await this.axios.get<{ data: AllStudents }>(`/mentor/me/students/all`);
    return result.data.data;
  }

  async getMentorStudents() {
    const result = await this.axios.get<{ data: StudentBasic[] }>(`/mentor/me/students`);
    return result.data.data;
  }

  async getInterviewStudents(courseTaskId: number) {
    const result = await this.axios.get<{ data: StudentBasic[] }>(`/mentor/me/interview/${courseTaskId}`);
    return result.data.data;
  }

  async postStudentInterviewResult(githubId: string, courseTaskId: number, data: any) {
    const result = await this.axios.post(`/student/${githubId}/interview/${courseTaskId}/result`, data);
    return result.data.data;
  }

  async postPublicFeedback(data: { toUserId: number; badgeId?: string; comment: string }) {
    type Response = { data: { heroesUrl: string } };
    const result = await this.axios.post<Response>(`/feedback`, data);
    return result.data.data;
  }

  async expelStudent(githubId: string, comment: string = '') {
    await this.axios.post(`/student/${githubId}/status`, { comment, status: 'expelled' });
  }

  async postTaskSolution(githubId: string, courseTaskId: number, url: string) {
    await this.axios.post(`/student/${githubId}/task/${courseTaskId}/cross-check/solution`, {
      url,
    });
  }

  async postTaskSolutionResult(githubId: string, courseTaskId: number, data: { score: number; comment: string }) {
    await this.axios.post(`/student/${githubId}/task/${courseTaskId}/cross-check/result`, data);
  }

  async getTaskSolutionResult(githubId: string, courseTaskId: number) {
    const result = await this.axios.get(`/student/${githubId}/task/${courseTaskId}/cross-check/result`);
    return result.data.data as { historicalScores: { score: number; comment: string; dateTime: number }[] } | null;
  }

  async postTaskVerification(courseTaskId: number, data: any) {
    await this.axios.post(`/student/me/task/${courseTaskId}/verification`, data);
  }

  async getTaskVerifications() {
    const result = await this.axios.get(`/student/me/tasks/verifications`);
    return result.data.data;
  }

  async getStageInterviews(stageId: number) {
    const result = await this.axios.get(`/stage/${stageId}/interviews`);
    return result.data.data;
  }

  async getAvailableStudentsForStageInterviews(stageId: number) {
    const result = await this.axios.get(`/stage/${stageId}/interviews/available-students`);
    return result.data.data;
  }

  async createInterview(stageId: number, students: { githubId: string }[]) {
    const result = await this.axios.post(`/stage/${stageId}/interview`, students);
    return result.data.data;
  }

  async deleteInterview(stageId: number, interviewId: number) {
    const result = await this.axios.delete(`/stage/${stageId}/interview/${interviewId}`);
    return result.data.data;
  }

  async getStageInterviewStudents(stageId: number) {
    const result = await this.axios.get(`/stage/${stageId}/interviews/students`);
    return result.data.data as StudentBasic[];
  }

  async postStageInterviews(stageId: number) {
    const result = await this.axios.post(`/stage/${stageId}/interviews`);
    return result.data.data;
  }

  async postStageInterviewFeedback(stageId: number, data: any) {
    const result = await this.axios.post(`/stage/${stageId}/interviews/feedback`, data);
    return result.data.data;
  }

  async getStageInterviewFeedback(stageId: number, studentId: number) {
    const result = await this.axios.get(`/stage/${stageId}/interviews/student/${studentId}`);
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

  async expelMentor(githubId: string) {
    await this.axios.post(`/mentor/${githubId}/status/expelled`);
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
    const result = await this.axios.get(`/student/${githubId}/task/${courseTaskId}/cross-check/feedback`);
    return result.data.data as { url?: string; comments?: { comment: string }[] };
  }

  async createCrossCheckDistribution(courseTaskId: number) {
    const result = await this.axios.post(`/task/${courseTaskId}/cross-check/distribution`);
    return result.data;
  }

  async createInterviewDistribution(courseTaskId: number) {
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

  async createUser(githubId: string, data: any) {
    const result = await this.axios.post(`/user/${githubId}`, data);
    return result.data;
  }

  async updateUser(githubId: string, data: any) {
    const result = await this.axios.put(`/user/${githubId}`, data);
    return result.data;
  }

  async getStudentSummary(githubId: string) {
    const result = await this.axios.get(`/student/${githubId}/summary`);
    return result.data.data as StudentSummary;
  }

  async getStudentScore(githubId: string) {
    const result = await this.axios.get(`/student/${githubId}/score`);
    return result.data.data as { totalScore: number; results: { courseTaskId: number; score: number }[] };
  }

  async getStudentInterviews(githubId: string) {
    const result = await this.axios.get(`/student/${githubId}/interviews`);
    return result.data.data as { name: string; endDate: string; completed: boolean; interviewer: any }[];
  }

  async getStudentCrossMentors(githubId: string) {
    const result = await this.axios.get(`/student/${githubId}/tasks/cross-mentors`);
    return result.data.data as { name: string; mentor: any }[];
  }

  isPowerUser(courseId: number, session: Session) {
    return (
      session.isAdmin ||
      session.roles[courseId] === 'coursemanager' ||
      session.coursesRoles?.[courseId]?.includes('manager')
    );
  }
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
  locationName: string;
  totalScore: number;
}

export interface StudentDetails extends StudentBasic {
  countryName: string;
  locationName: string;
  totalScore: number;
  repository: string;
  interviews: { id: number; isCompleted: boolean }[];
}

export interface MentorDetails extends MentorBasic {
  countryName: string;
  locationName: string;
  maxStudentsLimit: number;
  interviewsCount: number;
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
  mentor:
    | (MentorBasic & {
        contactsEmail?: string;
        contactsPhone?: string;
        contactsSkype?: string;
        contactsTelegram?: string;
        contactsNotes?: string;
      })
    | null;
}
