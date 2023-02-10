import config from '../config.ts';
import { getChannelMessages, getCurrentUserGuilds, getGuildChannels, getGuildRoles } from '../api/discord/discord-restapi.ts';
import { MessageType } from '../api/discord/discord-enums.ts';
import { Message } from '../api/discord/discord-model.ts';
import { eventBus, messageReceivedEvent } from './event-bus.ts';
import { registerError } from './cache.ts';

const { serverName, channelPrefix, limitInitialMessagesCount } = config.discord;

export const discordCache: {
  roles: Map<string, string> | null;
  channels: Map<string, string> | null;
  activeChannels: Set<string> | null;
} = {
  roles: null,
  channels: null,
  activeChannels: null,
};

export const processOldMessages = async () => {
  try {
    const guilds = await getCurrentUserGuilds();
    const guild = guilds.find((guild: { id: string; name: string; }) => guild.name === serverName);

    if (!guild) throw new Error(`Discord server with name "${serverName}" is not found. Please configure right name.`)

    const [channels, roles] = await Promise.all([
      getGuildChannels(guild.id),
      getGuildRoles(guild.id),
    ]);

    discordCache.channels = new Map(channels.map(channel => [channel.id, channel.name]));
    discordCache.roles = new Map(roles.map(roles => [roles.id, roles.name]));

    const filteredChannels = channels.filter((channel: { id: string; name: string; }) => channel.name.indexOf(channelPrefix) === 0);

    discordCache.activeChannels = new Set(filteredChannels.map(channel => channel.id));

    const messages: Message[] = [];
    for (const channel of filteredChannels) {
      let channelMessages = await getChannelMessages(channel.id, undefined, limitInitialMessagesCount );
      channelMessages = channelMessages.filter(message => message.content && (message.type === MessageType.DEFAULT || message.type === MessageType.REPLY));
      channelMessages.reverse();
      messages.push(...channelMessages);
    }
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    for (const message of messages) {
      eventBus.emit(messageReceivedEvent, message);
    }
  } catch (error) {
    await registerError('Discord Service', error);
    throw error;
  }
};
