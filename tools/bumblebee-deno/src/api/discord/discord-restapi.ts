import config from '../../config.ts';
import { Exception } from '../../utils/exception.ts';
import { RestApi, getRestApiPath } from './discord-enums.ts';
import { Message, Role, Guild, GuildChannel } from './discord-model.ts';

const { token } = config.discord;

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
  try {
    const response = await fetch(`${baseUrl}/v${version}${path}`, {
      headers: {
        'User-Agent': userAgent,
        'Authorization': authorization,
      },
    });

    const json = await response.json();

    if (response.ok === false) {
      throw new Exception('Discord Api', response.statusText, response.status, json);
    }

    return json;
  } catch (error) {
    throw error instanceof Exception
      ? error
      : new Exception('Discord Api', error.message ?? 'Unknown error', 500);
  }
}

/**
 * https://discord.com/developers/docs/resources/user#get-current-user-guilds
 */
export const getCurrentUserGuilds = (): Promise<Guild[]> => {
  const path = getRestApiPath(RestApi.GetCurrentUserGuilds);
  return request(path);
};

/**
 * https://discord.com/developers/docs/resources/guild#get-guild-channels
 */
export const getGuildChannels = (guildId: string): Promise<GuildChannel[]> => {
  const path = getRestApiPath(RestApi.GetGuildChannels, guildId);
  return request(path);
};

/**
 * https://discord.com/developers/docs/resources/guild#get-guild-roles
 */
export const getGuildRoles = (guildId: string): Promise<Role[]> => {
  const path = getRestApiPath(RestApi.GetGuildRoles, guildId);
  return request(path);
};

/**
 * https://discord.com/developers/docs/resources/channel#get-channel-messages
 */
export const getChannelMessages = (channelId: string, after?: string, limit = 1): Promise<Message[]> => {
  const params = getParams({ after, limit });
  const path = `${getRestApiPath(RestApi.GetChannelMessages, channelId)}?${params}`;

  return request(path);
};
