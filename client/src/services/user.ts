import axios from 'axios';

export interface UserBasic {
  firstName: string;
  lastName: string;
  githubId: string;
  id: number;
}

type SearchResponse = {
  data: UserBasic[];
};

export class UserService {
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
  certificateUrl: string;
  completed: boolean;
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
    lastName: string;
    firstName: string;
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
  externalAccounts: any[];
  englishLevel: string;
  readyFullTime: string;
  educationHistory: any[];
  employmentHistory: any[];
  firstNameNative: string;
  lastNameNative: string;
  contactsTelegram: string;
  contactsSkype: string;
  contactsEmail: string;
  primaryEmail: string;
  contactsEpamEmail: string;
  contactsPhone: string;
  locationId: number;
  locationName: string;
}

export interface ProfileResponse {
  user: UserFull;
  students: (ResponseStudent & { course: ResponseCourse })[];
  mentors: (ResponseMentor & { course: ResponseCourse })[];
}
