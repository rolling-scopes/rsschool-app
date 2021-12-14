module.exports = ({ client }) => ({
  description: 'Show status if rs-bumblebee is available',
  method: ({ chat: { id } }) => {
    const messages = [
      'I\'m here!',
      'Sir, yes, sir!',
      'I am waiting for orders.',
    ];

    console.log(id);
    const randomIndex = Math.floor(Math.random() * messages.length);

    client.sendMessage(id, messages[randomIndex]);
  },
});
