const fs = require("fs-extra");
const ytdl = require("ytdl-core");
const yts = require("yt-search");

module.exports = {
  config: {
    name: "video",
    aliases: ["v"],
    version: "1.3",
    role: 0,
    author: "AceGun",
    cooldowns: 5,
    shortdescription: "download music video from YouTube",
    longdescription: "",
    category: "media",
    usages: "{pn} video name",
    dependencies: {
      "fs-extra": "^10.0.0",  // Specify version for each dependency
      "request": "^2.88.2",
      "axios": "^0.24.0",
      "ytdl-core": "^5.0.5",
      "yt-search": "^2.6.1"
    }
  },

  onStart: async ({ bot, event }) => {
    const input = msg.text;
    const text = input.substring(12);
    const data = input.split(" ");

    if (data.length < 2) {
      return bot.sendMessage("Please specify a video name.", chatId);
    }

    data.shift();
    const videoName = data.join(" ");

    try {
      bot.setMessageReaction("⏳", msg.message_id, msg.message_id, bot);
      const searchMessage = await bot.sendMessage(`💁 | Finding video for "${videoName}".\n⏳ | Please wait...`, chatId);

      const searchResults = await yts(videoName);
      if (!searchResults.videos.length) {
        return bot.sendMessage("No videos found.", chatId, msg.message_id);
      }

      const video = searchResults.videos[0];
      const videoUrl = video.url;

      const stream = ytdl(videoUrl, { filter: "audioandvideo" });

      const fileName = `${userId}.mp4`;
      const filePath = __dirname + `/cache/${fileName}`;

      stream.pipe(fs.createWriteStream(filePath));

      stream.on('response', () => {
        console.info('[DOWNLOADER]', 'Starting download now!');
      });

      stream.on('info', (info) => {
        console.info('[DOWNLOADER]', `Downloading video: ${info.videoDetails.title}`);
      });

      stream.on('end', () => {
        console.info('[DOWNLOADER] Downloaded');

        if (fs.statSync(filePath).size > 26214400) {
          fs.unlinkSync(filePath);
          return bot.sendMessage('❌ | The file could not be sent because it is larger than 25MB.', chatId);
        }

        const message = {
          body: `💁‍♀ | Here's your video\n\n🔮 | Title: ${video.title}\n⏰ | Duration: ${video.duration.timestamp}`,
          attachment: fs.createReadStream(filePath)
        };

        bot.unsendMessage(searchMessage.messageID);
        bot.setMessageReaction("🎥", msg.message_id, msg.message_id, bot);
        
        bot.sendMessage(message, chatId, () => {
          fs.unlinkSync(filePath);
        });
      });
    } catch (error) {
      console.error('[ERROR]', error);
      bot.sendMessage('🦉 | An error occurred while processing the command.', chatId);
    }
  }
};
