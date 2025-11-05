const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "get", // renamed command
  version: "1.2.0",
  author: "Gtajisan",
  cooldown: 5,
  role: 0,
  description: "Get Free Fire profile image or full info by UID",
  usePrefix: true,
  commandCategory: "fan",
  usages: "get [uid] | get full [uid]"
};

module.exports.run = async function({ bot, event, args }) {
  if (!args[0]) return bot.sendMessage("❌ Please provide a UID.\nUsage: get [uid] | get full [uid]", chatId, msg.message_id);

  let fullMode = false;
  let uid = args[0];

  if (args[0].toLowerCase() === "full") {
    if (!args[1]) return bot.sendMessage("❌ Please provide a UID after 'full'.", chatId, msg.message_id);
    fullMode = true;
    uid = args[1];
  }

  try {
    if (fullMode) {
      // Fetch full profile info
      const res = await axios.get(`https://hridoy-ff-1.onrender.com/bot/get?uid=${uid}`);
      const data = res.data;

      if (!data || !data.name) return bot.sendMessage("❌ Profile not found.", chatId, msg.message_id);

      const infoText = `
💠 Name: ${data.name || "N/A"}
💠 UID: ${data.uid || "N/A"}
💠 Level: ${data.level || "N/A"}
💠 Rank: ${data.rank || "N/A"}
💠 Guild: ${data.guild || "N/A"}
💠 Status: ${data.status || "N/A"}
      `;

      bot.sendMessage(infoText, chatId, msg.message_id);

    } else {
      // Fetch profile image only
      const res = await axios.get(`https://hridoy-ff-1.onrender.com/bot/profile?uid=${uid}`);
      const data = res.data;

      if (!data || !data.profile || !data.profile.profile_picture) return bot.sendMessage("❌ Profile not found.", chatId, msg.message_id);

      const imgUrl = data.profile.profile_picture;
      const imgPath = path.join(__dirname, `ff-${uid}.jpg`);
      const imgRes = await axios({ url: imgUrl, responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(imgRes.data, "binary"));

      bot.sendMessage(
        { body: `✅ Profile image for UID ${uid}`, attachment: fs.createReadStream(imgPath) },
        chatId,
        () => fs.unlinkSync(imgPath),
        msg.message_id
      );
    }
  } catch (err) {
    console.error(err);
    bot.sendMessage("❌ Error fetching profile. Check UID or API availability.", chatId, msg.message_id);
  }
};
        
