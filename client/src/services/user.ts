import { EnglishLevel } from '@common/models';
import type {
  ConfigurableProfilePermissions,
  Contacts,
  Discord,
  GeneralInfo,
  Location,
  MentorStats,
  PublicFeedback,
  StageInterviewDetailedFeedback,
  StudentStats,
} from '@common/models/profile';
import { Rule } from 'antd/lib/form';
import { ProfileApi, ProfileDto, UpdateUserDtoLanguagesEnum, UsersNotificationsApi } from 'api';
import axios, { AxiosInstance } from 'axios';
import discordIntegration from '../configs/discord-integration';

export interface UserBasic {
  name: string;
  githubId: string;
  id: number;
}

type SearchResponse = { data: UserBasic[] };

const profileApi = new ProfileApi();
const usersApi = new UsersNotificationsApi();

export class UserService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create();
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

      const { username, discriminator, id } = (await response.json()) as {
        username: string;
        discriminator: string;
        id: string;
      };

      return {
        username,
        discriminator,
        id,
      };
    }

    return null;
  }

  async getCourses() {
    const { data } = await profileApi.getUserCourses('me');
    return data;
  }

  async searchUser(query: string | null) {
    try {
      if (!query) {
        return [];
      }
      const response = await this.axios.get<SearchResponse>(`/api/users/search/${query}`);
      return response.data.data;
    } catch {
      return [];
    }
  }

  async getMyProfile() {
    const response = await this.axios.get<{ data: UserFull }>(`/api/profile/me`);
    return response.data.data;
  }

  async getProfileInfo(githubId?: string) {
    const response = await this.axios.get<{ data: ProfileInfo }>(`/api/profile/info`, {
      params: { githubId },
    });
    return response.data.data;
  }

  async sendEmailConfirmationLink() {
    return usersApi.sendEmailConfirmationLink();
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
  externalAccounts: unknown[];
  englishLevel: string;
  readyFullTime: string;
  educationHistory: unknown[];
  employmentHistory: unknown[];
  contactsTelegram: string;
  contactsSkype: string;
  contactsWhatsApp: string;
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
  languages: UpdateUserDtoLanguagesEnum[];
  discord?: string;
}

export interface ProfileResponse {
  user: UserFull;
  students: (ResponseStudent & { course: ResponseCourse })[];
  mentors: (ResponseMentor & { course: ResponseCourse })[];
}

export type ProfileInfo = {
  permissionsSettings?: ConfigurableProfilePermissions;
  generalInfo?: GeneralInfo;
  contacts?: Contacts;
  mentorStats?: MentorStats[];
  studentStats?: StudentStats[];
  publicFeedback?: PublicFeedback[];
  stageInterviewFeedback?: StageInterviewDetailedFeedback[];
  discord: Discord | null;
} & ProfileDto;

export type ProfileMainCardData = {
  location: Location | null;
  name: string;
  githubId: string | null;
  publicCvUrl: string | null;
};

export const enum ContactsKeys {
  EpamEmail = 'epamEmail',
  Email = 'email',
  Telegram = 'telegram',
  Phone = 'phone',
  Skype = 'skype',
  WhatsApp = 'whatsApp',
  Notes = 'notes',
  LinkedIn = 'linkedIn',
}

export type Contact = {
  name: string;
  value: string | null;
  key: ContactsKeys;
  rules?: Rule[];
};
