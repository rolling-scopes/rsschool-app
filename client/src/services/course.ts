import axios from 'axios';
import getConfig from 'next/config';
import { Session } from '../components/withSession';

const { serverRuntimeConfig } = getConfig();

export interface CourseTask {
  id: number;
  courseTaskId?: number;
  taskId: number;
  name: string;
  maxScore: number | null;
  verification: 'auto' | 'manual';
  type: 'jstask' | 'htmltask' | 'externaltask';
  githubRepoName: string;
  scoreWeight: number;
  stageId: number;
  githubPrRequired: boolean;
  description: string | null;
  descriptionUrl: string | null;
  studentStartDate: string | null;
  studentEndDate: string | null;
  taskResultCount: number;
  useJury: boolean;
  checker: 'mentor' | 'assigned';
}

export interface CreateCourseTask {
  taskId: number;
  maxScore?: number;
  scoreWeight?: number;
  stageId: number;
}

export interface Course {
  id: number;
  name: string;
  fullName: string;
  alias: string;
  completed: boolean;
  description: string;
  endDate: string;
  planned: boolean;
  primarySkillId: string;
  primarySkillName: string;
  startDate: string;
  registrationEndDate: string;
}

export interface MentorWithContacts {
  githubId: string;
  email: string;
  phone: string;
}

export class CourseService {
  private host = serverRuntimeConfig.rsHost || '';

  static cookie?: any;

  async updateCourse(id: number, data: Partial<Course>) {
    const result = await axios.put<{ data: Course }>(`${this.host}/api/course/${id}`, data);
    return result.data.data;
  }

  async createCourse(data: Partial<Course>) {
    const result = await axios.post<{ data: Course }>(`${this.host}/api/course/`, data);
    return result.data.data;
  }

  async getCourses() {
    const result = await axios.get<{ data: Course[] }>(`${this.host}/api/courses`, {
      headers: CourseService.cookie
        ? {
            cookie: CourseService.cookie,
          }
        : undefined,
    });
    return result.data.data.sort((a, b) => b.id - a.id);
  }

  async getCourseTasks(courseId: number) {
    const result = await axios.get<{ data: CourseTask[] }>(`${this.host}/api/course/${courseId}/tasks`);
    return result.data.data;
  }

  async getCourseStudents(courseId: number, activeOnly?: boolean) {
    const result = await axios.get<{ data: StudentDetails[] }>(
      `${this.host}/api/course/${courseId}/students?status=${activeOnly ? 'active' : 'all'}`,
    );
    return result.data.data;
  }

  async getCourseTasksWithTaskCheckers(courseId: number) {
    const result = await axios.get<{ data: CourseTask[] }>(`${this.host}/api/course/${courseId}/tasksCheckers`);
    return result.data.data;
  }

  async createCourseTask(courseId: number, data: CreateCourseTask) {
    const result = await axios.post<{ data: CourseTask }>(`${this.host}/api/course/${courseId}/task`, data);
    return result.data.data;
  }

  async updateCourseTask(courseId: number, courseTaskId: number, data: any) {
    const result = await axios.put<{ data: CourseTask }>(
      `${this.host}/api/course/${courseId}/task/${courseTaskId}`,
      data,
    );
    return result.data.data;
  }

  async deleteCourseTask(courseId: number, courseTaskId: number) {
    const result = await axios.delete(`/api/course/${courseId}/task/${courseTaskId}`);
    return result.data.data;
  }

  async getCourseScore(courseId: number) {
    const result = await axios.get<{ data: StudentScore[] }>(`/api/course/${courseId}/score`);
    return result.data.data;
  }

  async postStudentScore(courseId: number, studentId: number, data: PostScore) {
    await axios.post(`/api/course/${courseId}/score`, {
      studentId,
      ...data,
    });
  }

  async getAllMentorStudents(courseId: number) {
    const result = await axios.get<{ data: { students: StudentBasic[]; assignedStudents: AssignedStudent[] } }>(
      `/api/course/${courseId}/mentor/me/students/all`,
    );
    return result.data.data;
  }

  async getMentorStudents(courseId: number) {
    const result = await axios.get<{ data: StudentBasic[] }>(`/api/course/${courseId}/mentor/me/students`);
    return result.data.data;
  }

  async postPublicFeedback(courseId: number, data: { toUserId: number; badgeId?: string; comment: string }) {
    const result = await axios.post<{ data: { heroesUrl: string } }>(`/api/course/${courseId}/feedback`, data);
    return result.data.data;
  }

  async expelStudent(courseId: number, studentId: number, comment: string = '') {
    await axios.post(`/api/course/${courseId}/expulsion`, {
      studentId,
      comment,
    });
  }

  isPowerUser(courseId: number, session: Session) {
    return session.isAdmin || session.roles[courseId] === 'coursemanager';
  }
}

export interface StudentProfile {
  courseId: number;
  totalScore: number;
  mentor: MentorWithContacts | null;
}

export interface StudentBasic {
  lastName: string;
  firstName: string;
  githubId: string;
  isActive: boolean;

  id: number;
  userId: number;
  courseId: number;

  mentor: MentorBasic | null;
}

export interface AssignedStudent extends StudentBasic {
  courseTaskId: number;
}

export interface MentorBasic {
  lastName: string;
  firstName: string;
  githubId: string;

  id: number;
  userId: number;
  courseId: number;

  students: StudentBasic[];
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
}

export interface PostScore {
  courseTaskId: number;
  score: number;
  comment?: string;
  githubPrUrl?: string;
}
