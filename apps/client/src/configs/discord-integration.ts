const isDevMode = process.env.NODE_ENV !== 'production';
const clientId = isDevMode ? '625945676009963521' : '978920245743976448';
const redirectUrl = isDevMode ? 'http://localhost:3000/profile' : 'https://app.rs.school/profile';

export default {
  api: {
    auth: `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUrl,
    )}&response_type=token&scope=identify`,
    me: 'https://discordapp.com/api/users/@me',
  },
};
