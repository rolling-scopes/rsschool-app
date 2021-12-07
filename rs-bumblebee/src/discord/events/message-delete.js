const { sendMessageToTelegram, telegramActions } = require('../utils');
const { filterDiscordMessage } = require('../filters');

module.exports = ({ telegramBot, store, channelNames }) => async (msg) => {
  const message = filterDiscordMessage(msg);

  if (channelNames.includes(message.channelName)) {
    if (store.has(message.id)) {
      sendMessageToTelegram({
        telegramBot,
        store,
        message,
        action: telegramActions.DELETE,
        messageId: store.get(message.id).telegramMessageId,
      });
      store.delete(message.id);

      global.console.log('DELETED =>', message);
    }
  }
};
