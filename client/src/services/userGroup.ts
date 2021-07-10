import axios from 'axios';
import { UserGroup } from './models';

type UserGroupResponse = { data: UserGroup };
type UserGroupsResponse = { data: UserGroup[] };

export class UserGroupService {
  async deleteUserGroup(id: number) {
    const result = await axios.delete<UserGroupResponse>(`/api/user-group/${id}`);
    return result.data.data;
  }

  async updateUserGroup(id: number, data: Partial<UserGroup>) {
    const result = await axios.put<UserGroupResponse>(`/api/user-group/${id}`, data);
    return result.data.data;
  }

  async createUserGroup(data: Partial<UserGroup>) {
    const result = await axios.post<UserGroupResponse>(`/api/user-group/`, data);
    return result.data.data;
  }

  async getUserGroups() {
    const result = await axios.get<UserGroupsResponse>(`/api/user-group`);
    return result.data.data;
  }
}
