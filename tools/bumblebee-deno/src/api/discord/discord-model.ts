import { MessageType, GatewayEventName, Opcode } from './discord-enums.ts';

/**
 * https://discord.com/developers/docs/topics/gateway#payloads-gateway-payload-structure
 */
export interface GatewayPayload {
  op: Opcode;
  s?: number | null;
  t?: GatewayEventName | null;
  // deno-lint-ignore no-explicit-any
  d?: any;
}

/**
 * https://discord.com/developers/docs/topics/gateway#hello-hello-structure
 */
export interface HelloGatewayPayload extends GatewayPayload {
  op: Opcode.Hello,
  d: {
    heartbeat_interval: number;
  }
}

/**
 * https://discord.com/developers/docs/topics/gateway#ready-ready-event-fields
 */
export interface DispatchReadyEvent {
  session_id: string;
  resume_gateway_url: string;
}

/**
 * https://discord.com/developers/docs/topics/gateway#message-delete-message-delete-event-fields
 */
export interface DispatchMessageDeleteEvent {
  id: string;
  channel_id: string;
}

/**
 * https://discord.com/developers/docs/topics/gateway#message-delete-bulk-message-delete-bulk-event-fields
 */
export interface DispatchMessageDeleteBulkEvent {
  ids: string[];
  channel_id: string;
}

/**
 * https://discord.com/developers/docs/topics/gateway#sending-payloads-example-gateway-dispatch
 */
export interface DispatchGatewayPayload<D> extends GatewayPayload {
  op: Opcode.Dispatch,
  s: number;
  t: GatewayEventName;
  d: D;
}

/**
 * https://discord.com/developers/docs/topics/gateway#invalid-session-example-gateway-invalid-session
 */
export interface InvalidSessionGatewayPayload extends GatewayPayload {
  op: Opcode.InvalidSession;
  d: boolean;
}

/**
 * https://discord.com/developers/docs/topics/gateway#heartbeat
 */
export interface HeartbeatGatewayPayload extends GatewayPayload {
  op: Opcode.Heartbeat;
  d: number | null;
}

/**
 * https://discord.com/developers/docs/topics/gateway#identify-identify-structure
 */
export interface IdentifyGatewayPayload extends GatewayPayload {
  op: Opcode.Identify;
  d: {
    token: string;
    intents: number;
    properties: {
      os: string;
      browser: string;
      device: string;
    }
  }
}

/**
 * https://discord.com/developers/docs/topics/gateway#resume-resume-structure
 */
export interface ResumeGatewayPayload extends GatewayPayload {
  op: Opcode.Resume;
  d: {
    token: string;
    session_id: string;
    seq: number;
  }
}

/**
 * https://discord.com/developers/docs/resources/user#user-object-user-structure
 */
interface User {
  id: string;
  username: string;
  discriminator: string;
}

/**
 * https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure
 */
interface MessageReference {
  message_id?: string;
}

/**
 * https://discord.com/developers/docs/resources/channel#channel-object-channel-structure
 */
export interface GuildChannel {
  id: string;
  name: string;
}

/**
 * https://discord.com/developers/docs/resources/guild#guild-object-guild-structure
 */
export interface Guild {
  id: string;
  name: string;
}

/**
 * https://discord.com/developers/docs/topics/permissions#role-object-role-structure
 */
export interface Role {
  id: string;
  name: string;
}

/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-structure
 */
export interface Message {
  id: string;
  type: MessageType;
  channel_id: string;
  content: string;
  timestamp: string;
  edited_timestamp: string | null;
  author: User;
  mentions: User[];
  mention_roles: string[];
  message_reference?: MessageReference;
}

export interface ParsedMessage {
  id: string;
  channel: string;
  content: string;
  timestamp: string;
  author: string;
}

export const toParsedMessage = (message: Message, channels: Map<string, string>, roles: Map<string, string>): ParsedMessage => {
  const channelsRegexp = /<#(\d)*>/g;
  const users = new Map(message.mentions.map(user => [user.id, `${message.author.username}#${message.author.discriminator}`]));
  const usersIds = message.mentions.map(user => user.id);
  const rolesIds = message.mention_roles;
  const channelsIds = [...new Set([...message.content.match(channelsRegexp) ?? []])].map(channel => channel.slice(2, channel.length - 1));

  let parsedContent = message.content;
  channelsIds.forEach(channelId => parsedContent = parsedContent.replaceAll(`<#${channelId}>`, `${channels.get(channelId) ?? 'Unknown Channel'}`));
  usersIds.forEach(userId => parsedContent = parsedContent.replaceAll(`<@${userId}>`, `${users.get(userId) ?? 'Unknown User'}`));
  rolesIds.forEach(roleId => parsedContent = parsedContent.replaceAll(`<@&${roleId}>`, `${roles.get(roleId) ?? 'Unknown Role'}`));

  return {
    id: message.id,
    channel: channels.get(message.channel_id) ?? 'Unknown Channel',
    content: parsedContent,
    timestamp: new Date(message.edited_timestamp ? message.edited_timestamp : message.timestamp).toISOString(),
    author: `${message.author.username}#${message.author.discriminator}`,
  };
};
