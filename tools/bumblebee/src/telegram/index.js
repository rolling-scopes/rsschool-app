const { createClient, listen } = require('./telegram-bot');

module.exports = async () => {
  const client = await createClient();

  listen(client);

  return client;
};
