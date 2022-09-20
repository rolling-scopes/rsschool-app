import { listenDiscord } from './discord/websocket.ts';
import { initDiscordApi } from './discord/restapi.ts';

console.debug = () => {};

await initDiscordApi();
listenDiscord();
