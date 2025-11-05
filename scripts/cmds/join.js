module.exports = {
  config: {
    name: "join",
    aliases: ["addme"],
    version: "1.0",
    author: "based",
    shortDescription: "Add yourself to a group by tid",
    longDescription: "Bot adds the command sender to a group specified by tid if bot is present",
    category: "owner",
    guide: "{pn}join <tid>"
  },

  onStart: async function({ message, args, bot, event }) {
    const tid = args[0];
    if (!tid) return bot.sendMessage(chatId, "❌ Please provide a group tid.");

    try {
      // Check if bot is in the group (usually optional, if API doesn't error)
      // Add the user who sent the command to the group
      await bot.addUserToGroup(userId, tid);

      return bot.sendMessage(chatId, `✅ Added you to the group with tid: ${tid}`);
    } catch (error) {
      console.error(error);
      return bot.sendMessage(chatId, "❌ Failed to add you to the group. Make sure the bot is in the group and has permission to add users.");
    }
  }
};
