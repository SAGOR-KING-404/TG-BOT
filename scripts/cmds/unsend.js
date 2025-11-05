    module.exports = {
	config: {
		name: "unsend",
		version: "1.2",
		author: "SaGor",
		cooldown: 5,
		role: 0,
		aliases: ["u", "uns"], 
		description: {
			vi: "Gỡ tin nhắn của bot",
			en: "Unsend bot's message"
		},
		category: "box chat",
		guide: {
			vi: "reply tin nhắn muốn gỡ của bot và gọi lệnh {pn}",
			en: "reply the message you want to unsend and call the command {pn}"
		}
	},

	langs: {
		vi: {
			syntaxError: "Vui lòng reply tin nhắn muốn gỡ của bot"
		},
		en: {
			syntaxError: "Please reply the message you want to unsend"
		}
	},

	onStart: async function ({ message, event, bot, getLang }) {
		if (!event.messageReply || event.messageReply.senderID != bot.getCurrentUserID())
			return bot.sendMessage(chatId, getLang("syntaxError"));
		message.unsend(event.messageReply.messageID);
	}
};
