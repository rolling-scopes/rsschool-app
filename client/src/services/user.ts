import axios from 'axios';

export interface User {
  firstName: string;
  lastName: string;
  githubId: string;
  id: number;
}

type SearchResponse = {
  data: User[];
};

export class UserService {
  async search(query: string | null) {
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
}
