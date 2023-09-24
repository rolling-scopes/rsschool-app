import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getApiConfiguration, getServerAxiosProps } from 'utils/axios';
import { EnglishLevel } from 'common/models';
import {
  ProfileApi,
  ProfileDto,
  ProfileInfoDto,
  UsersNotificationsApi,
  UpdateUserDtoLanguagesEnum,
  EmploymentRecordDto,
} from 'api';
import discordIntegration from '../configs/discord-integration';
import type {
  ConfigurableProfilePermissions,
  Contacts,
  Discord,
  GeneralInfo,
  MentorStats,
  PublicFeedback,
  StageInterviewDetailedFeedback,
  StudentStats,
  Location,
} from 'common/models/profile';
import { Rule } from 'antd/lib/form';

export interface UserBasic {
  name: string;
  githubId: string;
  id: number;
}

type SearchResponse = { data: UserBasic[] };

export class UserService {
  private axios: AxiosInstance;
  private profileApi: ProfileApi;
  private opts: AxiosRequestConfig;
  private usersApi: UsersNotificationsApi;

  constructor(private token?: string) {
    this.opts = getServerAxiosProps(this.token);
    this.axios = axios.create(this.opts);
    this.profileApi = new ProfileApi(getApiConfiguration(this.token));
    this.usersApi = new UsersNotificationsApi(getApiConfiguration(this.token));
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
    const { data } = await this.profileApi.getUserCourses('me');
    return data;
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

  async saveProfileInfo(profile: ProfileInfoDto) {
    await this.profileApi.updateProfileInfo(profile);
  }

  async sendEmailConfirmationLink() {
    return this.usersApi.sendEmailConfirmationLink();
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
  employmentHistory: EmploymentRecordDto[] | undefined;
} & ProfileDto;

export type ProfileMainCardData = {
  location: Location | null;
  name: string;
  githubId: string | null;
  publicCvUrl: string | null;
  employmentHistory: EmploymentRecordDto[] | undefined;
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
