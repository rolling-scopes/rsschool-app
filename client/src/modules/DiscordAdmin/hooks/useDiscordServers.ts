import { useState } from 'react';
import { useAsync } from 'react-use';
import { DiscordServersApi, UpdateDiscordServerDto, DiscordServerDto } from '@client/api';

export function useDiscordServers() {
  const [data, setData] = useState<DiscordServerDto[]>([]);
  const discordServersService = new DiscordServersApi();

  const loadData = async () => {
    const { data } = await discordServersService.getDiscordServers();
    setData(data);
  };

  const { loading } = useAsync(loadData, []);

  const createServer = async (values: UpdateDiscordServerDto) => {
    await discordServersService.createDiscordServer(values);
    await loadData();
  };

  const updateServer = async (id: number, values: UpdateDiscordServerDto) => {
    await discordServersService.updateDiscordServer(id, values);
    await loadData();
  };

  const deleteServer = async (id: number) => {
    await discordServersService.deleteDiscordServer(id);
    await loadData();
  };

  return { data, loading, createServer, updateServer, deleteServer };
}
