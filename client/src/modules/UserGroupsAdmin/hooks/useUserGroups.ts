import { useState } from 'react';
import { useAsync } from 'react-use';
import { UserGroupApi, UpdateUserGroupDto, UserGroupDto } from '@client/api';
import { UserService } from 'services/user';

const userGroupService = new UserGroupApi();
const userService = new UserService();

export function useUserGroups() {
  const [data, setData] = useState<UserGroupDto[]>([]);

  const loadData = async () => {
    const { data } = await userGroupService.getUserGroups();
    setData(data);
  };

  const { loading } = useAsync(loadData, []);

  const loadUsers = async (searchText: string) => {
    return userService.searchUser(searchText);
  };

  const createUserGroup = async (values: UpdateUserGroupDto) => {
    await userGroupService.createUserGroup(values);
    await loadData();
  };

  const updateUserGroup = async (id: number, values: UpdateUserGroupDto) => {
    await userGroupService.updateUserGroup(id, values);
    await loadData();
  };

  const deleteUserGroup = async (id: number) => {
    await userGroupService.deleteUserGroup(id);
    await loadData();
  };

  return { data, loading, loadUsers, createUserGroup, updateUserGroup, deleteUserGroup };
}
