const { saveTime } = require('../time-logger');
const { sendMessageToTelegram, telegramActions } = require('../utils');
const { filterDiscordMessage } = require('../filters');

module.exports = ({ telegramBot, store, channelNames }) => async (msg) => {
  const message = filterDiscordMessage(msg);

  if (channelNames.includes(message.channelName)) {
    sendMessageToTelegram({
      telegramBot, store, message, action: telegramActions.SEND,
    });

    await saveTime({ timestamp: message.createdTimestamp });

    global.console.log('SENT =>', message);
  }
};
