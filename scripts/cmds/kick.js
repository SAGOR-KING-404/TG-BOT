module.exports = {
	config: {
		name: "kick",
		version: "1.3",
		author: "NTKhang",
		cooldown: 5,
		role: 1,
		description: {
			vi: "Kick thành viên khỏi box chat",
			en: "Kick member out of chat box"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} @tags: dùng để kick những người được tag",
			en: "   {pn} @tags: use to kick members who are tagged"
		}
	},

	langs: {
		vi: {
			needAdmin: "Vui lòng thêm quản trị viên cho bot trước khi sử dụng tính năng này"
		},
		en: {
			needAdmin: "Please add admin for bot before using this feature"
		}
	},

	onStart: async function ({ message, event, args, threadsData, bot, getLang }) {
		const adminIDs = await threadsData.get(chatId, "adminIDs");
		if (!adminIDs.includes(bot.getCurrentUserID()))
			return bot.sendMessage(chatId, getLang("needAdmin"));
		async function kickAndCheckError(uid) {
			try {
				await bot.removeUserFromGroup(uid, chatId);
			}
			catch (e) {
				bot.sendMessage(chatId, getLang("needAdmin"));
				return "ERROR";
			}
		}
		if (!args[0]) {
			if (!event.messageReply)
				return message.SyntaxError();
			await kickAndCheckError(event.messageReply.senderID);
		}
		else {
			const uids = Object.keys(event.mentions);
			if (uids.length === 0)
				return message.SyntaxError();
			if (await kickAndCheckError(uids.shift()) === "ERROR")
				return;
			for (const uid of uids)
				bot.removeUserFromGroup(uid, chatId);
		}
	}
};