import { listenDiscord } from './api/discord/discord-websocket.ts';
import { processOldMessages } from './services/discord.ts';

console.debug = () => {};

await processOldMessages();
listenDiscord();
