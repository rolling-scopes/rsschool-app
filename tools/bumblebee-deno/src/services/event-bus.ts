import { EventEmitter } from '../dependencies.ts';
import { Message, toParsedMessage } from '../api/discord/discord-model.ts';
import { sendMessage, editMessageText, deleteMessage } from '../api/telegram/telegram-restapi.ts';
import { registerMessage, unregisterMessage, getMessage } from '../services/cache.ts';
import { discordCache } from '../services/discord.ts';
import { taskQueue } from '../services/task-queue.ts';

export const messageReceivedEvent = Symbol('Message received');
export const messageDeletedEvent = Symbol('Message deleted');

export const eventBus = new EventEmitter()

  .on(messageReceivedEvent, (event: Message) => taskQueue.add(async () => {
    console.info(messageReceivedEvent.description, event);

    const parsedMessage = toParsedMessage(event, discordCache.channels!, discordCache.roles!);

    console.info(messageReceivedEvent.description, 'content', parsedMessage.content);

    const { id, timestamp, channel, content, author } = parsedMessage;

    const message = getMessage(id);

    if (message === null) {
      if (parsedMessage.content.startsWith('error')) throw new Error(parsedMessage.content.slice(6));

      const { result } = await sendMessage(`${timestamp}\n *${author}* said in channel *${channel}* that\n\n${content}`);
      registerMessage(timestamp, id, result.message_id);
      console.log(result);
    } else if (message.timestamp !== timestamp) {
      if (parsedMessage.content.startsWith('error')) throw new Error(parsedMessage.content.slice(6));

      const { result } = await editMessageText(message.id, `${timestamp}\n *${author}* said in channel *${channel}* that\n\n${content} \n(Edited)`);
      console.log(result);
      registerMessage(timestamp, id, result.message_id);
      console.log(result);
    }
  }))

  .on(messageDeletedEvent, (event: string) => taskQueue.add(async() => {
    console.info(messageDeletedEvent.description, event);

    const message = getMessage(event);

    if (message !== null) {
      const result = await deleteMessage(message.id);
      if (result.ok) unregisterMessage(event);
    }
  }));
