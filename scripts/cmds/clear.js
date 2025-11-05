module.exports = {
  config: {
    name: "clear",
    aliases: [],
    author: "SaGor",  
    version: "2.0",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: ""
    },
    longDescription: {
      en: "unsent all messages sent by bot"
    },
    category: "𝗕𝗢𝗫",
    guide: {
      en: "{p}{n}"
    }
  },
  onStart: async function ({ bot, event }) {

    const unsendBotMessages = async () => {
      const threadID = chatId;


      const botMessages = await bot.getThreadHistory(threadID, 100); // Adjust the limit as needed 50 = 50 msg


      const botSentMessages = botMessages.filter(message => message.senderID === bot.getCurrentUserID());


      for (const message of botSentMessages) {
        await bot.unsendMessage(message.messageID);
      }
    };


    await unsendBotMessages();
  }
};