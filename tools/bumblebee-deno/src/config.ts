const isProd = Deno.args[0] === 'prod';

const getEnv = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} has not been set. Please configure environment variables.`);
  return value;
};

const config = {
  isProd,
  telegram: {
    token: getEnv('RS_BUMBLEBEE_TELEGRAM_TOKEN'),
    channelId: getEnv('RS_BUMBLEBEE_TELEGRAM_CHANNEL_ID'),
    adminChannelId: getEnv('RS_BUMBLEBEE_TELEGRAM_ADMIN_CHANNEL_ID'),
    pauseBetweenSends: getEnv('RS_BUMBLEBEE_PAUSE_BETWEEN_TELEGRAM_SENDS'),
  },
  discord: {
    token: getEnv('RS_BUMBLEBEE_DISCORD_TOKEN'),
    serverName: getEnv('RS_BUMBLEBEE_DISCORD_SERVER_NAME'),
    channelPrefix: getEnv('RS_BUMBLEBEE_DISCORD_CHANNEL_PREFIX'),
    limitInitialMessagesCount: Number(getEnv('RS_BUMBLEBEE_LIMIT_INITIAL_MESSAGES_COUNT')),
    apiUrl: 'wss://gateway.discord.gg/?v=10&encoding=json',
  },
};

export default config;
