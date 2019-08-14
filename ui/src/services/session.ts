import axios from 'axios';
import { IUserSession } from 'core/models';

type SessionResponse = {
  data: IUserSession;
};

export function getSession(): Promise<IUserSession> {
  return axios.get<SessionResponse>(`/api/session`).then(response => response.data.data);
}
