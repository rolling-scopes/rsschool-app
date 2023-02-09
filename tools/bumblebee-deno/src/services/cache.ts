import config from '../config.ts';
import { notifyAdmin } from '../api/telegram/telegram-restapi.ts'

const path = 'cache.json';

const encoder = new TextEncoder();

type Messages = Map<string, { id: number; timestamp: string; }>;
type Errors = Map<string, { error: string; timestamp: string; }>;

const writeToFile = () => {
  const text = config.isProd
    ? JSON.stringify({ messages: [...cache.messages], errors: [...cache.errors] })
    : JSON.stringify({ messages: [...cache.messages], errors: [...cache.errors] }, null, 2);
  const data = encoder.encode(text);
  Deno.writeFileSync(path, data);
};

const readFromFile = () => {
  try {
    const json = Deno.readTextFileSync(path);
    const { messages, errors = new Map() as Errors } = JSON.parse(json);
    return {
      messages: new Map(messages) as Messages,
      errors: new Map(errors) as Errors,
    };
  } catch {
    return {
      messages: new Map() as Messages,
      errors: new Map() as Errors,
    };
  }
};

export const getMessage = (discordMessageId: string) => cache.messages.get(discordMessageId) ?? null;

export const registerMessage = (timestamp: string, discordMessageId: string, telegramMessageId: number) => {
  cache.messages.set(discordMessageId, { id: telegramMessageId, timestamp });
  writeToFile();
};

export const unregisterMessage = (discordMessageId: string) => {
  cache.messages.delete(discordMessageId);
  writeToFile();
};

export const registerError = (error: Error) => {
  const errorText = error.stack ?? error.message;
  const timestamp = new Date().toISOString();

  if (!cache.errors.get(errorText)) {
    cache.errors.set(errorText, { error: errorText, timestamp });
    writeToFile();
    notifyAdmin(`Error has first occured at ${timestamp}:\n\n ${errorText}`).catch();
    console.log(cache.errors);
  }
};

const cache = readFromFile();
