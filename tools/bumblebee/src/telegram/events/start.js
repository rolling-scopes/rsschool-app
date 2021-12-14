module.exports = ({ client }) => ({
  description: 'Start rs-bumblebee',
  method: ({
    from: {
      first_name: firstName,
      last_name: lastName = '',
    },
    chat: { id },
  }) => {
    const message = `Hello *${firstName} ${lastName}*! Glad to see you.\nType /help for available options.`;

    client.sendMessage(id, message, { parse_mode: 'Markdown' });
  },
});
