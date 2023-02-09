import { EventEmitter } from '../deps.ts';
import { cache } from '../discord/restapi.ts';
import { sendMessage, editMessageText, deleteMessage } from '../telegram/restapi.ts';
import { registerMessage, unregisterMessage, getMessage } from '../cache/index.ts';
import { Message, toParsedMessage } from '../discord/model.ts';
import { handleAsyncError } from '../error/handle-error.ts';
import { queue } from '../queue/index.ts';

export const messageReceivedEvent = Symbol('Message received');
export const messageDeletedEvent = Symbol('Message deleted');

export const globalBus = new EventEmitter()

  .on(messageReceivedEvent, (event: Message) => queue.add(() => handleAsyncError(async () => {
    console.info(messageReceivedEvent.description, event);

    const parsedMessage = toParsedMessage(event, cache.channels!, cache.roles!);

    console.info(messageReceivedEvent.description, 'content', parsedMessage.content);

    const { id, timestamp, channel, content, author } = parsedMessage;

    const message = getMessage(id);

    if (message === null) {
      const { result } = await sendMessage(`${timestamp}\n *${author}* said in channel *${channel}* that\n\n${content}`);
      registerMessage(timestamp, id, result.message_id);
      console.log(result);
    } else if (message.timestamp !== timestamp) {
      const { result } = await editMessageText(message.id, `${timestamp}\n *${author}* said in channel *${channel}* that\n\n${content} \n(Edited)`);
      console.log(result);
      registerMessage(timestamp, id, result.message_id);
      console.log(result);
    }
  })))

  .on(messageDeletedEvent, (event: string) => queue.add(() => handleAsyncError(async() => {
    console.info(messageDeletedEvent.description, event);

    const message = getMessage(event);

    if (message !== null) {
      const result = await deleteMessage(message.id);
      if (result.ok) unregisterMessage(event);
    }
  })));
