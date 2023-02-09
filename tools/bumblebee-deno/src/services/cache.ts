const path = 'cache.json';

const encoder = new TextEncoder();

type Messages = Map<string, { id: number; timestamp: string; }>;

const writeToFile = () => {
  const text = JSON.stringify({
    messages: [...cache.messages],
  });
  const data = encoder.encode(text);
  Deno.writeFileSync(path, data);
};

const readFromFile = () => {
  try {
    const json = Deno.readTextFileSync(path);
    const { messages } = JSON.parse(json);
    return {
      messages: new Map(messages) as Messages,
    };
  } catch {
    return {
      messages: new Map() as Messages,
    };
  }
};

export const getMessage = (discordMessageId: string) => cache.messages.get(discordMessageId) ?? null;

export const registerMessage = (timestamp: string, discordMessageId: string, telegramMessageId: number) => {
  cache.messages.set(discordMessageId, { id: telegramMessageId, timestamp });
  writeToFile();
  console.log(cache.messages);
};

export const unregisterMessage = (discordMessageId: string) => {
  cache.messages.delete(discordMessageId);
  writeToFile();
  console.log(cache.messages);
};

const cache = readFromFile();
