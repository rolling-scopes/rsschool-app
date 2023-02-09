import config from '../config.ts';
import { RestApi, getRestApiPath, MessageType } from './enums.ts';
import { Message, Role, Guild, GuildChannel } from './model.ts';
import { globalBus, messageReceivedEvent } from '../bus/events.ts';

const { token, serverName, channelPrefix, limitInitialMessagesCount } = config.discord;

export const cache: {
  roles: Map<string, string> | null;
  channels: Map<string, string> | null;
  activeChannels: Set<string> | null;
} = {
  roles: null,
  channels: null,
  activeChannels: null,
};

/**
 * https://discord.com/developers/docs/reference#api-reference
 */
const baseUrl = 'https://discord.com/api';
const version = 10;
/**
 * https://discord.com/developers/docs/reference#authentication
 */
const authorization = `Bot ${token}`;
/**
 * https://discord.com/developers/docs/reference#user-agent
 */
const userAgent = `DiscordBot (${baseUrl}, ${version})`;

const getParams = (params: Record<string, string | boolean | number | undefined>) => new URLSearchParams(
  Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined) acc.push([key, String(value)]);
    return acc;
  }, [] as string[][]),
).toString();

const request = async (path: string) => {
  const response = await fetch(`${baseUrl}/v${version}${path}`, {
    headers: {
      'User-Agent': userAgent,
      'Authorization': authorization,
    },
  });
  return response.json();
}

/**
 * https://discord.com/developers/docs/resources/user#get-current-user-guilds
 */
const getCurrentUserGuilds = (): Promise<Guild[]> => {
  const path = getRestApiPath(RestApi.GetCurrentUserGuilds);
  return request(path);
};

/**
 * https://discord.com/developers/docs/resources/guild#get-guild-channels
 */
const getGuildChannels = (guildId: string): Promise<GuildChannel[]> => {
  const path = getRestApiPath(RestApi.GetGuildChannels, guildId);
  return request(path);
};

/**
 * https://discord.com/developers/docs/resources/guild#get-guild-roles
 */
const getGuildRoles = (guildId: string): Promise<Role[]> => {
  const path = getRestApiPath(RestApi.GetGuildRoles, guildId);
  return request(path);
};

/**
 * https://discord.com/developers/docs/resources/channel#get-channel-messages
 */
const getChannelMessages = (channelId: string, after?: string, limit = 1): Promise<Message[]> => {
  const params = getParams({ after, limit });
  const path = `${getRestApiPath(RestApi.GetChannelMessages, channelId)}?${params}`;
  return request(path);
};

export const initDiscordApi = async () => {
  const guilds = await getCurrentUserGuilds();
  const guild = guilds.find((guild: { id: string; name: string; }) => guild.name === serverName);

  if (!guild) throw new Error(`Discord server with name "${serverName}" is not found. Please configure right name.`)

  const [channels, roles] = await Promise.all([
    getGuildChannels(guild.id),
    getGuildRoles(guild.id),
  ]);

  cache.channels = new Map(channels.map(channel => [channel.id, channel.name]));
  cache.roles = new Map(roles.map(roles => [roles.id, roles.name]));

  const filteredChannels = channels.filter((channel: { id: string; name: string; }) => channel.name.indexOf(channelPrefix) === 0);

  cache.activeChannels = new Set(filteredChannels.map(channel => channel.id));

  const messages: Message[] = [];
  for (const channel of filteredChannels) {
    let channelMessages = await getChannelMessages(channel.id, undefined, limitInitialMessagesCount );
    channelMessages = channelMessages.filter(message => message.content && (message.type === MessageType.DEFAULT || message.type === MessageType.REPLY));
    channelMessages.reverse();
    messages.push(...channelMessages);
  }
  messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  for (const message of messages) {
    globalBus.emit(messageReceivedEvent, message);
  }
};
