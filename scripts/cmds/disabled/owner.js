const config = require('../../config.json');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const logger = console;

module.exports = {
    name: "github",
    version: "1.0.0",
    author: "frnwot",
    description: "Fetches GitHub user details for a given username.",
    adminOnly: false,
    commandCategory: "utility",
    guide: "Use {pn}github <username> to fetch GitHub user details.",
    cooldowns: 5,
    usePrefix: true,

    async execute({ bot, event, args }) {
        if (!event || !chatId || !msg.message_id) {
            console.error("Invalid event object in github command");
            return bot.sendMessage(`${config.bot.botName}: ❌ Invalid event data.`, chatId);
        }

        if (args.length === 0) {
            return bot.sendMessage(`${config.bot.botName}: ⚠️ Please provide a GitHub username. Usage: ${this.guide}`, chatId);
        }

        const username = args[0];
        const githubApiUrl = `https://bot.github.com/users/${username}`;

        try {
            const response = await axios.get(githubApiUrl);
            const userData = response.data;

            if (!userData || !userData.login) {
                throw new Error("User not found");
            }

            const profilePicUrl = userData.avatar_url;
            const tempFilePath = path.join(__dirname, `../../temp/github_${username}.png`);
            await fs.ensureDir(path.dirname(tempFilePath));

            const imageResponse = await axios.get(profilePicUrl, { responseType: 'arraybuffer' });
            await fs.writeFile(tempFilePath, imageResponse.data);

            const userDetails = [
                `╔═━─[ ${config.bot.botName} GITHUB USER ]─━═╗`,
                `┃ Username: ${userData.login}`,
                `┃ Bio: ${userData.bio || 'Not set'}`,
                `┃ Followers: ${userData.followers}`,
                `┃ Following: ${userData.following}`,
                `┃ Public Repos: ${userData.public_repos}`,
                `┃ Profile: ${userData.html_url}`,
                `╚═━──────────────────────────────━═╝`
            ].join('\n');

            await new Promise((resolve, reject) => {
                bot.sendMessage(
                    {
                        body: userDetails,
                        attachment: fs.createReadStream(tempFilePath)
                    },
                    chatId,
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });

            await fs.unlink(tempFilePath);
            logger.info(`Sent GitHub user details for ${username} and deleted temp file`);
        } catch (error) {
            logger.error(`Error in github command for username ${username}: ${error.message}`);
            bot.sendMessage(`${config.bot.botName}: ❌ Failed to fetch GitHub user details. User not found or API error.`, chatId);
        }
    }
};
