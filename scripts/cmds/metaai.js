module.exports = {
  config: {
    name: "metaai",
    author: "SaGor",
    category: "ai",
    cooldown: 5,
    role: 0,
    guide: { en: "metaai <prompt> - automatically mentions Meta AI and sends the prompt" }
  },

  onStart: async function({ message, event, args, bot }) {
    const prompt = args.join(" ").trim();
    if (!prompt) return bot.sendMessage(chatId, "❌ Please provide a prompt to send to Meta AI!");

    try {
      // Meta AI official account ID (replace with the correct one)
      const metaAIID = "META_AI_ID";

      // Send message mentioning Meta AI with exact space
      await bot.sendMessage(
        {
          body: `@Meta AI ${prompt}`,
          mentions: [{
            tag: "Meta AI",
            id: metaAIID
          }]
        },
        chatId
      );

      bot.sendMessage(chatId, "✅ Prompt sent to Meta AI! It should respond automatically.");
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, "❌ Failed to send prompt to Meta AI. Try again.");
    }
  }
};
