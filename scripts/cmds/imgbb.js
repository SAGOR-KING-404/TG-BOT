const axios = require('axios');
const FormData = require('form-data');

module.exports = {
  config: {
    name: "imgbb",
    aliases: ["i"],
    version: "1.0",
    author: "AceGun",
    cooldown: 5,
    role: 0,
    shortDescription: {
      en: "Converting an image to a convertible imgbb"
    },
    longDescription: {
      en: "Upload image to imgbb by replying to photo"
    },
    category: "tools",
    guide: {
      en: ""
    }
  },

  onStart: async function ({ bot, event }) {
    const imgbbApiKey = "1b4d99fa0c3195efe42ceb62670f2a25"; // Replace "YOUR_API_KEY_HERE" with your actual API key
    const linkanh = event.messageReply?.attachments[0]?.url;
    if (!linkanh) {
      return bot.sendMessage('Please reply to an image.', chatId, msg.message_id);
    }

    try {
      const response = await axios.get(linkanh, { responseType: 'arraybuffer' });
      const formData = new FormData();
      formData.append('image', Buffer.from(response.data, 'binary'), { filename: 'image.png' });
      const res = await axios.post('https://bot.imgbb.com/1/upload', formData, {
        headers: formData.getHeaders(),
        params: {
          key: imgbbApiKey
        }
      });
      const imageLink = res.data.data.url;
      return bot.sendMessage(imageLink, chatId, msg.message_id);
    } catch (error) {
      console.log(error);
      return bot.sendMessage('Failed to upload image to imgbb.', chatId, msg.message_id);
    }
  }
};