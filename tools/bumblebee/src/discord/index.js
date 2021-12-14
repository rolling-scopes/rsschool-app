const { createClient, listen } = require('./discord-bridge');

module.exports = async (telegramBot) => {
  const client = await createClient();

  listen(client, telegramBot);
};
