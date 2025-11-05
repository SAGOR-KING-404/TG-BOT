const fs = require('fs');
const path = require('path');
const axios = require('axios');
const fsExtra = require('fs-extra');
const config = require('../../config.json'); // your config file

module.exports = {
  config: {
    name: 'GitHub', // renamed command
    version: '1.0.3',
    author: 'frnwot',
    cooldown: 5,
    usePrefix: true,
    groupAdminOnly: false,
    description: 'Fetches GitHub user details for a given username.',
    category: 'media',
    guide: '{pn}GitHub <username>'
  },
  langs: {
    en: {
      missingUsername: '⚠️ Please provide a GitHub username. Usage: {pn}GitHub <username>',
      userNotFound: '❌ Failed to fetch GitHub user details. User not found or API error.',
      fetching: '⏳ Fetching GitHub user details...'
    }
  },
  onStart: async ({ bot, event, args, getLang }) => {
    if (!args[0]) return bot.sendMessage(getLang('missingUsername'), chatId);

    const username = args[0];
    const githubApiUrl = `https://bot.github.com/users/${username}`;
    const tempDir = path.join(__dirname, '../../temp');
    const tempFilePath = path.join(tempDir, `github_${username}.png`);

    try {
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const waitMsg = await bot.sendMessage(getLang('fetching'), chatId);

      const response = await axios.get(githubApiUrl);
      const userData = response.data;

      if (!userData || !userData.login) {
        await bot.unsendMessage(waitMsg.messageID);
        return bot.sendMessage(getLang('userNotFound'), chatId);
      }

      const imageResponse = await axios.get(userData.avatar_url, { responseType: 'arraybuffer' });
      fs.writeFileSync(tempFilePath, Buffer.from(imageResponse.data, 'binary'));

      const userDetails = [
        `╔═━─[ ${config.nickNameBot} GITHUB USER ]─━═╗`,
        `┃ Username: ${userData.login}`,
        `┃ Bio: ${userData.bio || 'Not set'}`,
        `┃ Followers: ${userData.followers}`,
        `┃ Following: ${userData.following}`,
        `┃ Public Repos: ${userData.public_repos}`,
        `┃ Profile: ${userData.html_url}`,
        `╚═━──────────────────────────────━═╝`
      ].join('\n');

      await bot.sendMessage(
        {
          body: userDetails,
          attachment: fs.createReadStream(tempFilePath)
        },
        chatId
      );

      await bot.unsendMessage(waitMsg.messageID);
      fs.unlinkSync(tempFilePath);

    } catch (error) {
      console.error('Error fetching GitHub user:', error);
      await bot.sendMessage(getLang('userNotFound'), chatId);
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
  }
};
