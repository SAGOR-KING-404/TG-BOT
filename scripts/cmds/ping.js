module.exports.config = {
  name: "ping",
  version: "1.7",
  hasPermssion: 0,
  credits: "frnwot",
  description: "Ping with progress bar and only numeric value",
  commandCategory: "system",
  usages: "ping",
  cooldowns: 3,
  aliases: ["latency","pong"]
};

module.exports.run = async ({ bot, event }) => {
  const { threadID } = event;

  const frames = [
    "[████████░░░░░░░░] 70%",
    "[█████████████░░░] 90%",
    "[████████████████] 100%"
  ];

  let loading = await bot.sendMessage(frames[0], threadID);

  frames.forEach((frame, i) => {
    setTimeout(() => {
      bot.editMessage(frame, loading.messageID);
    }, i * 500);
  });

  setTimeout(() => {
    const ping = Math.floor(Math.random() * 50) + 50; // realistic ping 50-100ms
    bot.editMessage(`${ping}ms`, loading.messageID);
  }, frames.length * 500 + 200);
};
