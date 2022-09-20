/**
 * https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes
 */
export enum Opcode {
  Dispatch,
  Heartbeat,
  Identify,
  PresenceUpdate,
  VoiceStateUpdate,
  _Unknown_5,
  Resume,
  Reconnect,
  RequestGuildMembers,
  InvalidSession,
  Hello,
  HeartbeatACK,
}

/**
 * https://discord.com/developers/docs/topics/gateway#list-of-intents
 * Should be used along with the left shift operation. Example: `1 << Intent.GUILD_MESSAGES`.
 *
 * **Note:** Please use getIntents function. It will do all the magic.
 */
export enum Intent {
  GUILDS,
  GUILD_MEMBERS,
  GUILD_BANS,
  GUILD_EMOJIS_AND_STICKERS,
  GUILD_INTEGRATIONS,
  GUILD_WEBHOOKS,
  GUILD_INVITES,
  GUILD_VOICE_STATES,
  GUILD_PRESENCES,
  GUILD_MESSAGES,
  GUILD_MESSAGE_REACTIONS,
  GUILD_MESSAGE_TYPING,
  DIRECT_MESSAGES,
  DIRECT_MESSAGE_REACTIONS,
  DIRECT_MESSAGE_TYPING,
  MESSAGE_CONTENT,
  GUILD_SCHEDULED_EVENTS,
  AUTO_MODERATION_CONFIGURATION,
  AUTO_MODERATION_EXECUTION,
}

export function getIntents(...args: Intent[]) {
  if (args.length === 0) throw new Error('At least one intent should be requested');

  return args.map(intent => 1 << intent).reduce((acc, cur) => acc + cur);
}

export enum GatewayEventName {
  READY = 'READY',
  MESSAGE_CREATE = 'MESSAGE_CREATE',
  MESSAGE_UPDATE = 'MESSAGE_UPDATE',
  MESSAGE_DELETE = 'MESSAGE_DELETE',
  MESSAGE_DELETE_BULK = 'MESSAGE_DELETE_BULK',
}

/**
 * **Note:** Please use getRestApiPath function to set up the parameters.
 */
export enum RestApi {
  GetCurrentUserGuilds = '/users/@me/guilds',
  GetGuildChannels = '/guilds/$1/channels',
  GetGuildRoles = '/guilds/$1/roles',
  GetChannelMessages = '/channels/$1/messages',
}

export function getRestApiPath(path: RestApi, ...params: string[]) {
  const regexp = /\$\d+/g;
  const matches = [...new Set([...path.match(regexp) ?? []])];

  if (matches.length !== params.length) throw new Error('Parameters should be set for every replacer that starts with "$" and contains number');

  return matches.reduce((acc, match) => acc.replaceAll(match, params[+match.slice(1) - 1]), path);
}

/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-types
 */
export enum MessageType {
  DEFAULT,
  RECIPIENT_ADD,
  RECIPIENT_REMOVE,
  CALL,
  CHANNEL_NAME_CHANGE,
  CHANNEL_ICON_CHANGE,
  CHANNEL_PINNED_MESSAGE,
  USER_JOIN,
  GUILD_BOOST,
  GUILD_BOOST_TIER_1,
  GUILD_BOOST_TIER_2,
  GUILD_BOOST_TIER_3,
  CHANNEL_FOLLOW_ADD,
  _UNKNOWN_13,
  GUILD_DISCOVERY_DISQUALIFIED,
  GUILD_DISCOVERY_REQUALIFIED,
  GUILD_DISCOVERY_GRACE_PERIOD_INITIAL_WARNING,
  GUILD_DISCOVERY_GRACE_PERIOD_FINAL_WARNING,
  THREAD_CREATED,
  REPLY,
  CHAT_INPUT_COMMAND,
  THREAD_STARTER_MESSAGE,
  GUILD_INVITE_REMINDER,
  CONTEXT_MENU_COMMAND,
  AUTO_MODERATION_ACTION,
}
