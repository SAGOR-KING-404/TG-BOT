const { exec } = require('child_process');

module.exports = {
 config: {
 name: "shell",
 aliases: ["sh"], // Added alias
 version: "1.0",
 author: "SaGor",
 cooldown: 5,
 role: 2,
 shortDescription: "Execute shell commands",
 longDescription: "",
 category: "owner",
 guide: {
 en: "{p}{n} <command>" // Removed Vietnamese guide for simplicity
 }
 },

 onStart: async function ({ args, message, event, bot }) {
 const command = args.join(" ");

 if (!command) {
 return bot.sendMessage(chatId, "Please provide a command to execute.");
 }

 exec(command, (error, stdout, stderr) => {
 if (error) {
 console.error(`Error executing command: ${error}`);
 return bot.sendMessage(chatId, `An error occurred while executing the command: ${error.message}`);
 }

 if (stderr) {
 console.error(`Command execution resulted in an error: ${stderr}`);
 return bot.sendMessage(chatId, `Command execution resulted in an error: ${stderr}`);
 }

 console.log(`Command executed successfully:\n${stdout}`);
 bot.sendMessage(chatId, `Command executed successfully:\n${stdout}`);
 });
 }
};
