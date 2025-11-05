const tinyurl = require("tinyurl");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "q",
    author: "SaGor",
    version: "1.0",
    cooldowns: 5,
    role: 0,
    category: "media",
    guide: "{pn} <your text> | blank | reply to someone",
  },
  onStart: async function ({ message, args, bot, event, usersData }) {
    const prompt = args.join(" ");
    let pfp, userName;

    if (event.type === "message_reply") {
      const avatarUrl = await usersData.getAvatarUrl(event.messageReply.senderID);
      pfp = await tinyurl.shorten(avatarUrl);
      userName = await usersData.getName(event.messageReply.senderID);
    } else {
      const avatarUrl = await usersData.getAvatarUrl(userId);
      pfp = await tinyurl.shorten(avatarUrl);
      userName = await usersData.getName(userId);
    }

    if (!prompt) {
      return bot.sendMessage("Please provide a prompt.", chatId);
    }

    bot.sendMessage("✅ | please wait", chatId, msg.message_id);

    try {
      const fcApiUrl = `https://bot.screenshotone.com/take?access_key=tM9HZDTpbuRO2w&url=https%3A%2F%2Fshahadats-fakechat-bot.onrender.com%2F%3FprofileImageUrl%3D${encodeURIComponent(pfp)}%26name%3D${encodeURIComponent(userName)}%26text%3D${encodeURIComponent(prompt)}&full_page=true&viewport_width=2100&viewport_height=385&device_scale_factor=1&format=jpg&image_quality=100&block_ads=true&block_cookie_banners=true&block_banners_by_heuristics=false&block_trackers=true&delay=0&timeout=60`;

      bot.sendMessage(chatId, { attachment: await global.utils.getStreamFromURL(fcApiUrl) });
    } catch (error) {
      console.error("Error:", error);
      bot.sendMessage("❌ | An error occurred. Please try again later.", chatId, msg.message_id);
    }
  }
};