module.exports = ({ client }) => ({
  description: 'Show this message',
  method: ({ chat: { id } }) => {
    // eslint-disable-next-line global-require
    const events = require('./index');

    const message = Object.keys(events)
      .map(eventName => `/${eventName} : ${events[eventName]({ client }).description}`)
      .join('\n');

    client.sendMessage(id, message, { parse_mode: 'Markdown' });
  },
});
