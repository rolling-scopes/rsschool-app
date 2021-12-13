const { saveTime, readTime } = require('../time-logger');
const {
  getChannel, getMessages, sendMessageToTelegram, telegramActions,
} = require('../utils');
const defaults = require('../../constants/defaults');

module.exports = ({
  client, telegramBot, store, channelNames,
}) => async () => {
  const limit = Number(process.env.RS_BUMBLEBEE_LIMIT_INITIAL_MESSAGES_COUNT
    || defaults.RS_BUMBLEBEE_LIMIT_INITIAL_MESSAGES_COUNT);

  const pause = Number(process.env.RS_BUMBLEBEE_PAUSE_BETWEEN_TELEGRAM_SENDS
    || defaults.PAUSE_BETWEEN_TELEGRAM_SENDS);

  global.console.log('Discord client is listening...');

  const channels = (await Promise.all(channelNames
    .map(channel => getChannel(client, channel))))
    .filter(channel => channel);

  const messages = (await Promise.all(channels
    .map(channel => getMessages(channel, limit))))
    .reduce((acc, cur) => acc.concat(cur), []);

  const savedTimestamp = (await readTime()).timestamp;
  const messagesAfterTimestamp = messages
    .filter(({ editedTimestamp, createdTimestamp }) => {
      const timestamp = editedTimestamp || createdTimestamp;
      return savedTimestamp < timestamp;
    });

  messagesAfterTimestamp.reverse();
  await Promise.all(messagesAfterTimestamp
    .map((message, index) => new Promise(resolve => setTimeout(async () => {
      await sendMessageToTelegram({
        telegramBot, store, message, action: telegramActions.SEND,
      });
      resolve();
    }, pause * index))));

  global.console.log('MESSAGES WERE SENT =>', messagesAfterTimestamp);

  const timestamp = Date.now();
  await saveTime({ timestamp });
};
