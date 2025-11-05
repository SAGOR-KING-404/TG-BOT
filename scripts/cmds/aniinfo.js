const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "aniinfo",
    aliases: ["animeinfo", "a-info"],
    version: "1.0",
    author: "nexo_here",
    cooldown: 0,
    role: 0,
    description: "Get anime information using Jikan API",
    category: "anime",
    guide: {
      en: "{pn} [anime name] — shows anime details using Jikan API"
    }
  },

  onStart: async function ({ bot, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return bot.sendMessage("❗ Anime name missing. Try: aniinfo demon slayer", chatId);
    }

    try {
      const res = await axios.get(`https://bot.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
      const anime = res.data.data[0];

      if (!anime) return bot.sendMessage("❌ No results found.", chatId);

      const {
        title,
        title_english,
        type,
        episodes,
        status,
        score,
        aired,
        synopsis,
        images,
        genres,
        url
      } = anime;

      const msg = `🎬 Title: ${title_english || title}
📺 Type: ${type}
📊 Score: ${score || "?"}/10
📡 Status: ${status}
🎞 Episodes: ${episodes || "?"}
📅 Aired: ${aired.string || "?"}
🎭 Genres: ${genres.map(g => g.name).join(", ")}

📝 Description:
${synopsis?.substring(0, 400) || "No synopsis found."}...

🔗 ${url}`;

      const imageURL = images.jpg.large_image_url;
      const imgData = (await axios.get(imageURL, { responseType: "arraybuffer" })).data;
      const filePath = path.join(__dirname, "aniinfo.jpg");
      fs.writeFileSync(filePath, imgData);

      bot.sendMessage(
        {
          body: msg,
          attachment: fs.createReadStream(filePath)
        },
        chatId,
        () => fs.unlinkSync(filePath),
        msg.message_id
      );

    } catch (err) {
      console.error(err);
      bot.sendMessage("🚫 Error fetching anime data. Please try again.", chatId);
    }
  }
};
