const Discord = require('discord.js');
const moment = require('moment-timezone');
const { catcher } = require('../lib/common');
const events = require('./events');
const { LOCALE } = require('../constants/discord-bridge');

moment.locale(LOCALE);

module.exports.createClient = catcher(async () => {
  const { RS_BUMBLEBEE_DISCORD_TOKEN } = process.env;

  const client = new Discord.Client();
  client.login(RS_BUMBLEBEE_DISCORD_TOKEN);

  return client;
});

module.exports.listen = catcher(async (client, telegram) => {
  const { RS_BUMBLEBEE_DISCORD_CHANNEL_NAMES } = process.env;
  const channelNames = RS_BUMBLEBEE_DISCORD_CHANNEL_NAMES.split(',');
  const store = new Map();

  const telegramBot = await telegram;

  Object.keys(events).forEach((eventName) => {
    client.on(eventName, catcher(events[eventName]({
      client, telegramBot, store, channelNames,
    })));
  });
});
