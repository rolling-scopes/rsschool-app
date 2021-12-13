const punycode = require('punycode');
const moment = require('moment-timezone');
const { catcher } = require('../lib/common');
const { filterDiscordMessage } = require('./filters');
const {
  TIMEZONE,
  TIME_FORMAT,
  // TELEGRAM_PARSE_MODE,
} = require('../constants/discord-bridge');

const formatMessage = ({
  username, channelName, content, createdTimestamp, editedTimestamp,
} = { username: 'Somebody' }) => {
  const timestamp = moment.tz(editedTimestamp || createdTimestamp, TIMEZONE);
  const time = timestamp.format(TIME_FORMAT);

  return `${time}\n *${username}* said in channel *${channelName}* that\n\n${content}`;
};

module.exports.sendMessageToTelegram = catcher(async ({
  telegramBot, store, message, action, messageId,
}) => {
  const { RS_BUMBLEBEE_TELEGRAM_CHANNEL_ID } = process.env;

  // let telegramMessage;
  // try {
  //   telegramMessage = await action({
  //     messageId,
  //     bot: telegramBot,
  //     channelId: TELEGRAM_CHANNEL_ID,
  //     message: formatMessage(message),
  //     parseMode: TELEGRAM_PARSE_MODE,
  //   });
  // } catch (err) {
  // global.console.log('Error =>', err.message);

  const telegramMessage = await action({
    messageId,
    bot: telegramBot,
    channelId: RS_BUMBLEBEE_TELEGRAM_CHANNEL_ID,
    message: formatMessage(message),
    parseMode: null,
  });
  // }

  const telegramMessageId = telegramMessage.message_id;

  store.set(message.id, { telegramMessageId, message });
});

module.exports.telegramActions = {
  SEND: ({
    bot, channelId, message, parseMode,
  }) => bot.sendMessage(channelId, message, { parse_mode: parseMode }),

  DELETE: ({
    bot, channelId, messageId,
  }) => bot.deleteMessage(channelId, messageId),

  EDIT: ({
    bot, channelId, message, messageId, parseMode,
  }) => bot.editMessageText(message, {
    chat_id: channelId,
    message_id: messageId,
    parse_mode: parseMode,
  }),
};

module.exports.getChannel = catcher(
  (client, channelName) => client.channels
    .find(channel => punycode.encode(channel.name) === punycode.encode(channelName)),
);

module.exports.getMessages = catcher(async (channel, limit) => {
  const messages = await channel.fetchMessages({ limit });
  const filteredMessages = [...messages]
    .map(([, msg]) => filterDiscordMessage(msg));

  return filteredMessages;
});
