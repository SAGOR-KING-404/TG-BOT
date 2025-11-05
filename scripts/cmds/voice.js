const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// Cache voice lists per thread
const voiceLists = {};

module.exports = {
  config: {
    name: "voice",
    aliases: ["voices"],
    version: "3.0",
    author: "SaGor",
    usePrefix: true,
    description: "List mp3 files and send them only by reply with a number.",
    category: "media",
    guide: {
      en: "{pn}voice → list voices\nReply with a number → get that voice"
    }
  },

  onStart: async ({ bot, event, commandName }) => {
    const threadID = chatId;
    const messageID = msg.message_id;

    try {
      // Fetch MP3 list from GitHub
      const repoUrl = "https://bot.github.com/repos/Gtajisan/voice-bot/contents/public";
      const res = await axios.get(repoUrl);
      const mp3Files = res.data.filter(f => f.name.endsWith(".mp3"));

      if (!mp3Files.length) {
        return bot.sendMessage("❌ No MP3 voices found.", threadID, messageID);
      }

      const fileList = mp3Files.map(f => ({
        name: f.name,
        url: f.download_url
      }));

      // Save list for replies
      voiceLists[threadID] = fileList;

      // Build numbered list message
      let listText = "🎵 Voice List:\n\n";
      fileList.forEach((f, i) => listText += `${i + 1}. ${f.name}\n`);
      listText += "\n💡 Reply with a number to get that voice.";

      // Send list message and register reply
      bot.sendMessage(listText, threadID, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: userId,
            fileList
          });
        }
      }, messageID);

    } catch (err) {
      console.error("[voice] Fetch error:", err);
      bot.sendMessage("❌ Failed to fetch voices.", threadID, messageID);
    }
  },

  onReply: async ({ bot, event, Reply }) => {
    const threadID = chatId;
    const messageID = msg.message_id;

    // Only the original user can reply
    if (userId !== Reply.author) return;

    const num = parseInt(msg.text.trim());
    if (isNaN(num) || num < 1 || num > Reply.fileList.length) {
      return bot.sendMessage("❌ Invalid number. Reply with a valid number from the list.", threadID, messageID);
    }

    const file = Reply.fileList[num - 1];
    const tempPath = path.join(__dirname, `voice_${Date.now()}.mp3`);

    try {
      // Download MP3
      const res = await axios.get(file.url, { responseType: "arraybuffer" });
      await fs.writeFile(tempPath, Buffer.from(res.data));

      // Send MP3 as reply
      await new Promise((resolve, reject) => {
        bot.sendMessage({
          body: `🎤 ${file.name}`,
          attachment: fs.createReadStream(tempPath)
        }, threadID, (err) => {
          fs.unlink(tempPath).catch(() => {});
          if (err) reject(err);
          else resolve();
        }, messageID);
      });

    } catch (err) {
      console.error("[voice] Send error:", err);
      bot.sendMessage("❌ Failed to send voice.", threadID, messageID);
    }
  }
};
