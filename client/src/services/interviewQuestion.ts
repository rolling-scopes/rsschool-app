import axios, { AxiosInstance } from 'axios';
import { getServerAxiosProps } from 'utils/axios';
import { InterviewQuestion, InterviewQuestionCategory } from './models';

type InterviewQuestionResponse = { data: InterviewQuestion };
type InterviewQuestionsResponse = { data: InterviewQuestion[] };
type InterviewQuestionCategoryResponse = { data: InterviewQuestionCategory };
type InterviewQuestionCategoriesResponse = { data: InterviewQuestionCategory[] };

export class InterviewQuestionService {
  private axios: AxiosInstance;

  constructor(token?: string) {
    this.axios = axios.create(getServerAxiosProps(token));
  }

  async createInterviewQuestion(data: Partial<InterviewQuestion>) {
    const result = await this.axios.post<InterviewQuestionResponse>(`/api/interview-question`, data);
    return result.data.data;
  }

  async updateInterviewQuestion(id: number, data: Partial<InterviewQuestion>) {
    const result = await this.axios.put<InterviewQuestionResponse>(`/api/interview-question/${id}`, data);
    return result.data.data;
  }

  async deleteInterviewQuestion(id: number) {
    const result = await this.axios.delete<InterviewQuestionResponse>(`/api/interview-question/${id}`);
    return result.data.data;
  }

  async getInterviewQuestions() {
    const result = await this.axios.get<InterviewQuestionsResponse>(`/api/interview-question`);
    return result.data.data;
  }
}

export class InterviewQuestionCategoryService {
  private axios: AxiosInstance;

  constructor(token?: string) {
    this.axios = axios.create(getServerAxiosProps(token));
  }

  async createInterviewQuestionCategory(data: Partial<InterviewQuestionCategory>) {
    const result = await this.axios.post<InterviewQuestionCategoryResponse>(`/api/interview-question-category`, data);
    return result.data.data;
  }

  async getInterviewQuestionCategories() {
    const result = await this.axios.get<InterviewQuestionCategoriesResponse>(`/api/interview-question-category`);
    return result.data.data;
  }

  async updateInterviewQuestionCategory(id: number, data: Partial<InterviewQuestionCategory>) {
    const result = await this.axios.put<InterviewQuestionCategoryResponse>(
      `/api/interview-question-category/${id}`,
      data,
    );
    return result.data.data;
  }

  async deleteInterviewQuestionCategory(id: number) {
    const result = await this.axios.delete<InterviewQuestionCategoryResponse>(`/api/interview-question-category/${id}`);
    return result.data.data;
  }
}
