const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "accept",
    aliases: ['acp'],
    version: "1.0",
    author: "Loid Butter",
    cooldown: 8,
    role: 2,
    shortDescription: "accept users",
    longDescription: "accept users",
    category: "Utility",
  },

  onReply: async function ({ message, Reply, event, bot, commandName }) {
    const { author, listRequest, messageID } = Reply;
    if (author !== userId) return;

    const args = msg.text.trim().toLowerCase().split(" ");
    clearTimeout(Reply.unsendTimeout);

    const form = {
      av: bot.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      variables: {
        input: {
          source: "friends_tab",
          actor_id: bot.getCurrentUserID(),
          client_mutation_id: Math.random().toString(36).substring(2, 15)
        },
        scale: 3,
        refresh_num: 0
      }
    };

    const success = [];
    const failed = [];

    if (args[0] === "add") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
      form.doc_id = "3147613905362928";
    } else if (args[0] === "del") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
      form.doc_id = "4108254489275063";
    } else {
      return bot.sendMessage("Please select <add | del> <number | all>", chatId, msg.message_id);
    }

    let targetIDs = args[1] === "all" ? listRequest.map((_, idx) => idx + 1) : args.slice(1);
    const promiseFriends = [];

    for (const stt of targetIDs) {
      const index = parseInt(stt) - 1;
      const user = listRequest[index];

      if (!user) {
        failed.push(`Can't find target ${stt}`);
        continue;
      }

      form.variables.input.friend_requester_id = user.node.id;
      promiseFriends.push(bot.httpPost("https://www.facebook.com/bot/graphql/", {
        ...form,
        variables: JSON.stringify(form.variables)
      }));

      success.push({ name: user.node.name, id: user.node.id });
    }

    const finalSuccess = [];
    const finalFailed = [];

    for (let i = 0; i < promiseFriends.length; i++) {
      try {
        const res = await promiseFriends[i];
        const data = JSON.parse(res);
        if (data.errors) {
          finalFailed.push(success[i].name);
        } else {
          finalSuccess.push(success[i].name);
        }
      } catch {
        finalFailed.push(success[i].name);
      }
    }

    let resultMsg = "";
    if (finalSuccess.length) {
      resultMsg += `✅ ${args[0] === "add" ? "Accepted" : "Deleted"}: ${finalSuccess.length} user(s)\n${finalSuccess.join("\n")}`;
    }
    if (finalFailed.length) {
      resultMsg += `\n❌ Failed: ${finalFailed.length} user(s)\n${finalFailed.join("\n")}`;
    }
    if (!resultMsg) {
      resultMsg = "No users were processed.";
    }

    bot.unsendMessage(messageID);
    return bot.sendMessage(resultMsg, chatId);
  },

  onStart: async function ({ event, bot, commandName }) {
    const form = {
      av: bot.getCurrentUserID(),
      fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
      fb_api_caller_class: "RelayModern",
      doc_id: "4499164963466303",
      variables: JSON.stringify({ input: { scale: 3 } })
    };

    try {
      const response = await bot.httpPost("https://www.facebook.com/bot/graphql/", form);
      const listRequest = JSON.parse(response)?.data?.viewer?.friending_possibilities?.edges || [];

      if (listRequest.length === 0) {
        return bot.sendMessage("No pending friend requests found.", chatId);
      }

      let msg = "";
      listRequest.forEach((user, i) => {
        msg += `\n${i + 1}. Name: ${user.node.name}`
          + `\nID: ${user.node.id}`
          + `\nURL: ${user.node.url.replace("www.facebook", "fb")}`
          + `\nTime: ${moment().tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss")}\n`;
      });

      bot.sendMessage(
        `${msg}\nReply to this message with: <add | del> <number | all>`,
        chatId,
        (e, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            listRequest,
            author: userId,
            unsendTimeout: setTimeout(() => {
              bot.unsendMessage(info.messageID);
            }, this.config.countDown * 1000)
          });
        },
        msg.message_id
      );
    } catch (error) {
      console.error(error);
      bot.sendMessage("Error retrieving friend request list.", chatId);
    }
  }
};
