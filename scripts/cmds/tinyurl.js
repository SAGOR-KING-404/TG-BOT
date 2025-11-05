const tinyurl = require('tinyurl');

module.exports = {
  config: {
    name: "tinyurl",
    version: "1.0",
    author: "SaGor",
    description: "Shorten URLs using TinyURL",
    usage: "{p}tinyurl(replied).",
    category: "Utility",
    role: 0,
  },

  onStart: async function ({ message, event, bot }) {
    if (event.type !== "message_reply" || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return bot.sendMessage({ body: "❌ | Please reply to an attachment." }, chatId, msg.message_id);
    }

    const attachment = event.messageReply.attachments[0];

    try {
      const shortUrl = await tinyurl.shorten(attachment.url);
      bot.sendMessage({ body: `${shortUrl}` }, chatId, msg.message_id);
    } catch (error) {
      bot.sendMessage({ body: "❌ | Error occurred while shortening URL." }, chatId, msg.message_id);
      console.error(error);
    }
  }
};