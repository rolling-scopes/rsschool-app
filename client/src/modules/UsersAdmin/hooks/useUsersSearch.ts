import { useState } from 'react';
import { UsersApi, UserSearchDto } from '@client/api';

const userApi = new UsersApi();

export function useUsersSearch() {
  const [users, setUsers] = useState<UserSearchDto[] | null>(null);

  const searchUsers = async (searchText: string) => {
    if (!searchText) return;
    const users = await userApi.searchUsers(searchText);
    setUsers(users.data);
  };

  return { users, searchUsers };
}
