import axios from 'axios';
import { InterviewQuestion, InterviewQuestionCategory } from './models';

type InterviewQuestionResponse = { data: InterviewQuestion };
type InterviewQuestionsResponse = { data: InterviewQuestion[] };
type InterviewQuestionCategoryResponse = { data: InterviewQuestionCategory };
type InterviewQuestionCategoriesResponse = { data: InterviewQuestionCategory[] };

export class InterviewQuestionService {
  async createInterviewQuestion(data: Partial<InterviewQuestion>) {
    const result = await axios.post<InterviewQuestionResponse>(`/api/interview-question`, data);
    return result.data.data;
  }

  async updateInterviewQuestion(id: number, data: Partial<InterviewQuestion>) {
    const result = await axios.put<InterviewQuestionResponse>(`/api/interview-question/${id}`, data);
    return result.data.data;
  }

  async deleteInterviewQuestion(id: number) {
    const result = await axios.delete<InterviewQuestionResponse>(`/api/interview-question/${id}`);
    return result.data.data;
  }

  async getInterviewQuestions() {
    const result = await axios.get<InterviewQuestionsResponse>(`/api/interview-question`);
    return result.data.data;
  }
}

export class InterviewQuestionCategoryService {
  async createInterviewQuestionCategory(data: Partial<InterviewQuestionCategory>) {
    const result = await axios.post<InterviewQuestionCategoryResponse>(`/api/interview-question`, data);
    return result.data.data;
  }

  async getInterviewQuestionCategories() {
    const result = await axios.get<InterviewQuestionCategoriesResponse>(`/api/interview-question-category`);
    return result.data.data;
  }
}
