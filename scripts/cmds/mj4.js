const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

async function downloadImage(url, filePath) {
  const resp = await axios.get(url, { responseType: "arraybuffer" });
  await fs.writeFile(filePath, resp.data);
}

module.exports = {
  config: {
    name: "mj4",
    aliases: ["mj-4", "mj4cmd"],
    version: "1.0",
    author: "SaGor",
    role: 0,
    shortDescription: "Generate image via mj-4 API",
    category: "IMAGE",
    guide: "{pn} <prompt> — e.g. mj4 a futuristic city skyline"
  },

  onStart: async function ({ bot, event, args }) {
    const prompt = args.join(" ").trim();
    if (!prompt) {
      return bot.sendMessage(
        "❌ Please provide a prompt.\nExample: mj4 a beautiful sunset over mountains",
        chatId,
        msg.message_id
      );
    }

    const waitMsg = await bot.sendMessage("🎨 Generating image via mj-4…", chatId, msg.message_id);

    try {
      const resp = await axios.get("https://dev.oculux.xyz/bot/mj-4", {
        params: { prompt },
        timeout: 60000
      });

      const data = resp.data;

      // **Adjust this part based on the actual JSON response**
      // Common keys might be: data.url, data.image_url, data.result, data.output, data.images[0]
      let imgUrl = data.image_url || data.url || data.result || data.output;
      if (!imgUrl && Array.isArray(data.images) && data.images.length > 0) {
        imgUrl = data.images[0];
      }

      if (!imgUrl) {
        return bot.sendMessage(
          "❌ Failed: no image URL found in mj-4 API response",
          chatId,
          waitMsg.messageID
        );
      }

      const fileName = `mj4_${Date.now()}.jpg`;
      const dir = path.join(__dirname, "cache");
      await fs.ensureDir(dir);
      const filePath = path.join(dir, fileName);

      await downloadImage(imgUrl, filePath);

      bot.sendMessage(
        { body: "✅ Done!", attachment: fs.createReadStream(filePath) },
        chatId,
        () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        },
        waitMsg.messageID
      );
    } catch (err) {
      console.error("mj-4 API error:", err.response?.data || err.message);
      bot.sendMessage("❌ Error generating image via mj-4 API", chatId, waitMsg.messageID);
    }
  }
};
