const { saveTime } = require('../time-logger');
const { sendMessageToTelegram, telegramActions } = require('../utils');
const { filterDiscordMessage } = require('../filters');

module.exports = ({ telegramBot, store, channelNames }) => async (oldMessage, newMessage) => {
  const message = filterDiscordMessage(newMessage);

  if (channelNames.includes(message.channelName)) {
    if (store.has(message.id)) {
      sendMessageToTelegram({
        telegramBot,
        store,
        message,
        action: telegramActions.EDIT,
        messageId: store.get(message.id).telegramMessageId,
      });
    } else {
      sendMessageToTelegram({
        telegramBot, store, message, action: telegramActions.SEND,
      });
    }

    const timestamp = Date.now();
    await saveTime({ timestamp });

    global.console.log('UPDATED =>', message);
  }
};
