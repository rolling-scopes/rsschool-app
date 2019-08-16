import axios from 'axios';
import getConfig from 'next/config';
import { Session } from '../components/withSession';

const { serverRuntimeConfig } = getConfig();

export interface CourseTask {
  courseTaskId: number;
  taskId: number;
  name: string;
  maxScore: number | null;
  verification: 'auto' | 'manual';
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

export interface Stage {
  id: number;
  createdDate: string;
  updatedDate: string;
  name: string;
}

export interface Course {
  id: number;
  name: string;
  alias: string;
  completed: boolean;
  planned: boolean;
}

export interface MentorWithContacts {
  githubId: string;
  email: string;
  phone: string;
}

export class CourseService {
  private host = serverRuntimeConfig.rsHost || '';

  async getCourses() {
    const result = await axios.get<{ data: Course[] }>(`${this.host}/api/courses`);
    return result.data.data;
  }

  async getCourseTasks(courseId: number) {
    const result = await axios.get<{ data: CourseTask[] }>(`${this.host}/api/course/${courseId}/tasks`);
    return result.data.data;
  }

  async getCourseStudents(courseId: number) {
    const result = await axios.get<{ data: StudentBasic[] }>(`${this.host}/api/course/${courseId}/students`);
    return result.data.data;
  }

  async getCourseTasksWithTaskCheckers(courseId: number) {
    const result = await axios.get<{ data: CourseTask[] }>(`${this.host}/api/course/${courseId}/tasksCheckers`);
    return result.data.data;
  }

  async getStages(courseId: number) {
    const result = await axios.get<{ data: Stage[] }>(`${this.host}/api/course/${courseId}/stages`);
    return result.data.data;
  }

  async createCourseTask(courseId: number, data: CreateCourseTask) {
    const result = await axios.post(`${this.host}/api/course/${courseId}/task`, data);
    return result.data.data;
  }

  async updateCourseTask(courseId: number, courseTaskId: number, data: any) {
    const result = await axios.put(`${this.host}/api/course/${courseId}/task/${courseTaskId}`, data);
    return result.data.data;
  }

  async deleteCourseTask(courseId: number, courseTaskId: number) {
    const result = await axios.delete(`/api/course/${courseId}/task/${courseTaskId}`);
    return result.data.data;
  }

  async getStudentProfile(courseId: number) {
    const result = await axios.get<{
      data: StudentProfile;
    }>(`/api/course/${courseId}/student/profile`);
    return result.data.data;
  }

  async getCourseScore(courseId: number) {
    const result = await axios.get<{
      data: StudentScore[];
    }>(`/api/course/${courseId}/score`);
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
      `/api/course/${courseId}/mentor/students/all`,
    );
    return result.data.data;
  }

  async getMentorStudents(courseId: number) {
    const result = await axios.get<{ data: { students: StudentBasic[] } }>(`/api/course/${courseId}/mentor/students`);
    return result.data.data.students;
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

export interface PostScore {
  courseTaskId: number;
  score: number;
  comment?: string;
  githubPrUrl?: string;
}
