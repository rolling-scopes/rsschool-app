const TelegramBot = require('node-telegram-bot-api');
const { catcher } = require('../lib/common');
const events = require('./events');

module.exports.createClient = catcher(async () => {
  const { RS_BUMBLEBEE_TELEGRAM_TOKEN, RS_BUMBLEBEE_TELEGRAM_ADMIN_CHANNEL_ID } = process.env;

  const telegram = new TelegramBot(RS_BUMBLEBEE_TELEGRAM_TOKEN, { polling: true });

  telegram.sendMessage(RS_BUMBLEBEE_TELEGRAM_ADMIN_CHANNEL_ID, 'rs-bumblebee was started!');

  return telegram;
});

module.exports.listen = catcher(async (client) => {
  const awaitedClient = await client;

  Object.keys(events).forEach((eventName) => {
    const eventRegexp = new RegExp(`/${eventName}`);

    client.onText(eventRegexp, catcher(events[eventName]({
      client: awaitedClient,
    }).method));
  });
});
