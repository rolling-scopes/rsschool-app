import { EventEmitter } from '../deps.ts';
import { cache } from '../discord/restapi.ts';
import { Message, ParsedMessage, toParsedMessage } from '../discord/model.ts';

export const messageReceivedEvent = Symbol('Message received');
export const messageParsedEvent = Symbol('Message parsed');
export const messageDeletedEvent = Symbol('Message deleted');

export const globalBus = new EventEmitter()

  .on(messageReceivedEvent, (event: Message) => {
    console.debug(messageReceivedEvent.description, event);

    globalBus.emit(messageParsedEvent, toParsedMessage(event, cache.channels!, cache.roles!));
  })

  .on(messageParsedEvent, (event: ParsedMessage) => {
    console.info(messageParsedEvent.description, event, event.content);
  })

  .on(messageDeletedEvent, (event: string) => {
    console.info(messageDeletedEvent.description, event);
  });
