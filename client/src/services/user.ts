import axios from 'axios';
import getConfig from 'next/config';
import { Course } from './course';
import { StageInterview } from '../../../server/src/models/stageInterview';

const { serverRuntimeConfig } = getConfig();

export interface UserBasic {
  name: string;
  githubId: string;
  id: number;
}

type SearchResponse = {
  data: UserBasic[];
};

export class UserService {
  private host = serverRuntimeConfig.rsHost || '';

  static cookie?: any;

  async getCourses() {
    const result = await axios.get<{ data: Course[] }>(`${this.host}/api/user/me/courses`, {
      headers: UserService.cookie ? { cookie: UserService.cookie } : undefined,
    });
    return result.data.data.sort((a, b) => b.id - a.id);
  }

  async searchUser(query: string | null) {
    try {
      if (!query) {
        return [];
      }
      const response = await axios.get<SearchResponse>(`/api/users/search/${query}`);
      return response.data.data;
    } catch (e) {
      return [];
    }
  }

  async extendedUserSearch(query: string | null) {
    try {
      if (!query) {
        return [];
      }
      const response = await axios.get<SearchResponse>(`/api/users/search/extended/${query}`);
      return response.data.data;
    } catch (e) {
      return [];
    }
  }

  async submitPrivateFeedback(data: { toUserId: number; comment: string }) {
    await axios.post(`/api/feedback/private`, {
      toUserId: Number(data.toUserId),
      comment: data.comment,
    });
  }

  async getProfile(githubId?: string) {
    const response = await axios.get<{ data: ProfileResponse }>(`/api/profile${githubId ? '' : '/me'}`, {
      params: { githubId },
    });
    return response.data.data;
  }

  async updateUser(data: Partial<UserFull>) {
    const response = await axios.post<{ data: UserFull }>(`/api/profile/me`, data);
    return response.data.data;
  }
}

export type ResponseStudent = {
  id: number;
  totalScore: number;
  certificatePublicId: string;
  completed: boolean;
  stageInterviews: StageInterview[];
  interviews: {
    score: number;
    comment: string;
    formAnswers: {
      questionText: string;
      answer: string;
    }[];
    courseTask: {
      id: number;
      name: string;
      descriptionUrl: string;
    };
  }[];
  taskResults: {
    score: number;
    githubPrUrl: string;
    comment: string;
    courseTask: {
      id: number;
      name: string;
      descriptionUrl: string;
    };
  }[];
  mentor: {
    id: number;
    githubId: string;
    name: string;
  } | null;
};

export type ResponseMentor = {
  id: number;
  students: {
    id: number;
    userId: number;
    githubId: string;
    lastName: string;
    firstName: string;
  }[];
};

export type ResponseCourse = {
  id: number;
  name: string;
};

export interface UserFull extends UserBasic {
  firstName: string;
  lastName: string;
  externalAccounts: any[];
  englishLevel: string;
  readyFullTime: string;
  educationHistory: any[];
  employmentHistory: any[];
  contactsTelegram: string;
  contactsSkype: string;
  contactsEmail: string;
  primaryEmail: string;
  contactsEpamEmail: string;
  contactsPhone: string;
  contactsNotes: string;
  locationId: number;
  locationName: string;
  aboutMyself: string;
  tshirtSize: string;
}

export interface ProfileResponse {
  user: UserFull;
  students: (ResponseStudent & { course: ResponseCourse })[];
  mentors: (ResponseMentor & { course: ResponseCourse })[];
}
