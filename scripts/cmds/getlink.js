module.exports = {
  config: {
    name: "getlink",
    version: "1.0",
    author: "AceGun",
    cooldown: 5,
    role: 0,
    shortDescription: "",
    longDescription: {
      en: ".",
    },
    category: "media",
    guide: {
      en: "{prefix} <reply with img or vid>",
    },
  },

  onStart: async function ({ bot, event, getText }) {
    const { messageReply } = event;

    if (event.type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length !== 1) {
      return bot.sendMessage(getText("invalidFormat"), chatId, msg.message_id);
    }

    return bot.sendMessage(messageReply.attachments[0].url, chatId, msg.message_id);
  }
};