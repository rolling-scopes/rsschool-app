import axios, { AxiosInstance } from 'axios';
import { NextPageContext } from 'next';
import { getServerAxiosProps } from 'utils/axios';
import { EnglishLevel } from '../../../common/models';
import { ProfileInfo, SaveProfileInfo } from '../../../common/models/profile';
import { GetCVData, SaveCVData, JobSeekerData } from '../../../common/models/cv';
import { Course } from './models';
import discordIntegration from '../configs/discord-integration';

export interface UserBasic {
  name: string;
  githubId: string;
  id: number;
}

type SearchResponse = { data: UserBasic[] };

export class UserService {
  private axios: AxiosInstance;

  constructor(ctx?: NextPageContext) {
    this.axios = axios.create(getServerAxiosProps(ctx));
  }

  async getDiscordIds() {
    const fragment = new URLSearchParams(window.location.hash.slice(1));

    if (fragment.has('access_token')) {
      const accessToken = fragment.get('access_token');
      const tokenType = fragment.get('token_type');

      const response = await fetch(discordIntegration.api.me, {
        headers: {
          authorization: `${tokenType} ${accessToken}`,
        },
      });

      const { username, discriminator, id } = await response.json();

      return {
        username,
        discriminator,
        id,
      };
    }

    return null;
  }

  async getCourses() {
    const result = await this.axios.get<{ data: Course[] }>(`/api/user/me/courses`);
    return result.data.data.sort((a, b) => b.id - a.id);
  }

  async searchUser(query: string | null) {
    try {
      if (!query) {
        return [];
      }
      const response = await this.axios.get<SearchResponse>(`/api/users/search/${query}`);
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
      const response = await this.axios.get<SearchResponse>(`/api/users/search/extended/${query}`);
      return response.data.data;
    } catch (e) {
      return [];
    }
  }

  async submitPrivateFeedback(data: { toUserId: number; comment: string }) {
    await this.axios.post(`/api/feedback/private`, {
      toUserId: Number(data.toUserId),
      comment: data.comment,
    });
  }

  async submitStudentFeedback(data: { toUserId: number; comment: string }, courseId: string) {
    await this.axios.post(`api/course/${courseId}/student/feedback`, {
      toUserId: Number(data.toUserId),
      comment: data.comment,
    });
  }

  async getMyProfile() {
    const response = await this.axios.get<{ data: UserFull }>(`/api/profile/me`);
    return response.data.data;
  }

  async updateMyProfile(data: Partial<UserFull>) {
    const response = await this.axios.post<{ data: UserFull }>(`/api/profile/me`, data);
    return response.data.data;
  }

  async getProfileInfo(githubId?: string) {
    const response = await this.axios.get<{ data: ProfileInfo }>(`/api/profile/info`, {
      params: { githubId },
    });
    return response.data.data;
  }

  async saveProfileInfo(profile: SaveProfileInfo) {
    const response = await this.axios.post<{ data: SaveProfileInfo }>(`/api/profile/info`, profile);
    return response.data.data;
  }

  async getJobSeekers() {
    const response = await this.axios.get<{data: JobSeekerData[]}>('/api/opportunities');
    return response.data.data;
  }

  async getCVData(githubId: string) {
    const response = await this.axios.get<{ data: GetCVData }>(`/api/opportunities/${githubId}`);
    return response.data.data;
  }

  async saveCVData(githubId: string, opportunitiesInfo: SaveCVData) {
    const response = await this.axios.post<{ data: SaveCVData }>(`/api/opportunities/${githubId}`, opportunitiesInfo);
    return response.data.data;
  }

  async getOpportunitiesConsent(githubId: string) {
    const response = await this.axios.get<{ data: boolean }>(`/api/opportunities/consent/${githubId}`);
    return response.data.data;
  }

  async changeOpportunitiesConsent(githubId: string, opportunitiesConsent: boolean) {
    const response = await this.axios.post<{ data: boolean }>(`/api/opportunities/consent/${githubId}`,{opportunitiesConsent});
    return response.data.data;
  }


}

export type ResponseStudent = {
  id: number;
  totalScore: number;
  certificatePublicId: string;
  completed: boolean;
  stageInterviews: {
    date: string;
    isGoodCandidate: boolean;
    english: EnglishLevel;
    comment: string;
    rating: number;
    programmingTask: {
      task: string;
      resolved: number;
      codeWritingLevel: number;
      comment: string;
    };
    interviewer: {
      githubId: string;
      name: string;
    };
    skills: {
      htmlCss: number;
      common: number;
      dataStructures: number;
    };
  }[];
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
  countryName: string;
  cityName: string;
}

export interface ProfileResponse {
  user: UserFull;
  students: (ResponseStudent & { course: ResponseCourse })[];
  mentors: (ResponseMentor & { course: ResponseCourse })[];
}
