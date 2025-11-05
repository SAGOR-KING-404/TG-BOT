const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const axios = require('axios');
const gradient = require('gradient-string');

// Load global utilities for command compatibility
require('./utils.js');
const TelegramAdapter = require('./telegram-adapter.js');

const chatGroupsFile = path.join(__dirname, 'chatGroups.json');
const messageCountFile = path.join(__dirname, 'messageCount.json');
const userDataFile = path.join(__dirname, 'userData.json');

if (!fs.existsSync(messageCountFile)) {
    fs.writeFileSync(messageCountFile, JSON.stringify({}), 'utf8');
}

if (!fs.existsSync(chatGroupsFile)) {
    fs.writeFileSync(chatGroupsFile, JSON.stringify([]), 'utf8');
}

if (!fs.existsSync(userDataFile)) {
    fs.writeFileSync(userDataFile, JSON.stringify({}), 'utf8');
}

let chatGroups = JSON.parse(fs.readFileSync(chatGroupsFile, 'utf8'));
let gbanList = [];

// Use environment variable for token if available, fallback to config
const botToken = process.env.TELEGRAM_BOT_TOKEN || config.token;
const bot = new TelegramBot(botToken, { polling: true });

const commands = [];
let adminOnlyMode = false;
const cooldowns = new Map();

async function fetchGbanList() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/samirxpikachuio/Gban/main/Gban.json');
        gbanList = response.data.map(user => user.ID);
    } catch (error) {
        logger('⚠️ Error fetching gban list');
    }
}

fetchGbanList();
cron.schedule('*/5 * * * *', fetchGbanList);

fs.readdirSync('./scripts/cmds').forEach((file) => {
    if (file.endsWith('.js')) {
        try {
            const command = require(`./scripts/cmds/${file}`);
            if (typeof command.config.role === 'undefined') {
                command.config.role = 0;
            }
            if (typeof command.config.cooldown === 'undefined') {
                command.config.cooldown = 0;
            }
            commands.push({ ...command, config: { ...command.config, name: command.config.name.toLowerCase() } });
            registerCommand(bot, command);
        } catch (error) {
            console.error(gradient.passion(`❌ Error loading ${file}: ${error.message}`));
        }
    }
});

function registerCommand(bot, command) {
    const usePrefix = command.config.usePrefix !== false;
    const prefixPattern = usePrefix ? `^${config.prefix}${command.config.name}\\b(.*)$` : `^${command.config.name}\\b(.*)$`;
    bot.onText(new RegExp(prefixPattern, 'i'), (msg, match) => {
        executeCommand(bot, command, msg, match);
    });
}

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    
    try {
        const data = JSON.parse(callbackQuery.data);
        const commandName = data.command;

        const command = commands.find(cmd => cmd.config.name === commandName);
        if (command && command.onReply) {
            command.onReply({ bot, chatId, userId, data, callbackQuery });
        }
    } catch (error) {
        console.error('Callback query error:', error);
    }
});

async function isUserAdmin(bot, chatId, userId) {
    try {
        const chatAdministrators = await bot.getChatAdministrators(chatId);
        return chatAdministrators.some(admin => admin.user.id === userId);
    } catch (error) {
        return false;
    }
}

async function executeCommand(bot, command, msg, match) {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const username = msg.from.username;
        const firstName = msg.from.first_name;
        const lastName = msg.from.last_name || '';
        const args = match[1].trim().split(/\s+/).filter(arg => arg.length > 0);

        const messageReply = msg.reply_to_message;
        const messageReply_username = messageReply ? messageReply.from.username : null;
        const messageReply_id = messageReply ? messageReply.from.id : null;

        if (gbanList.includes(userId.toString())) {
            return bot.sendMessage(chatId, "❌ You are globally banned and cannot use commands.");
        }

        const isAdmin = await isUserAdmin(bot, chatId, userId);
        const isBotAdmin = userId === config.owner_id;

        if (adminOnlyMode && !isBotAdmin) {
            return bot.sendMessage(chatId, "⚠️ Bot is in admin-only mode.");
        }

        if (command.config.role === 2 && !isBotAdmin) {
            return bot.sendMessage(chatId, "⚠️ This command is for bot admin only.");
        }

        if (command.config.role === 1 && !isBotAdmin && !isAdmin) {
            return bot.sendMessage(chatId, "⚠️ This command is for group admins only.");
        }

        const cooldownKey = `${command.config.name}-${userId}`;
        const now = Date.now();
        if (cooldowns.has(cooldownKey)) {
            const lastUsed = cooldowns.get(cooldownKey);
            const cooldownAmount = (command.config.cooldown || 0) * 1000;
            if (now < lastUsed + cooldownAmount) {
                const timeLeft = Math.ceil((lastUsed + cooldownAmount - now) / 1000);
                return bot.sendMessage(chatId, `⏱️ Wait ${timeLeft}s before using ${command.config.name} again.`);
            }
        }

        cooldowns.set(cooldownKey, now);

        // Create Telegram adapter for Messenger-compatible API
        const api = new TelegramAdapter(bot);
        
        await command.onStart({ 
            bot, 
            chatId, 
            args, 
            userId, 
            username, 
            firstName, 
            lastName, 
            messageReply, 
            messageReply_username, 
            messageReply_id, 
            msg, 
            match,
            event: {
                threadID: chatId,
                messageID: msg.message_id,
                senderID: userId,
                body: msg.text || ''
            },
            api,
            message: {
                reply: (text) => bot.sendMessage(chatId, text, { reply_to_message_id: msg.message_id })
            }
        });
    } catch (error) {
        console.error(gradient.passion(`❌ Error in ${command.config.name}: ${error.message}`));
        bot.sendMessage(msg.chat.id, `❌ Error: ${error.message}`);
    }
}

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
        const messageCount = JSON.parse(fs.readFileSync(messageCountFile));

        if (!messageCount[chatId]) {
            messageCount[chatId] = {};
        }
        if (!messageCount[chatId][userId]) {
            messageCount[chatId][userId] = 0;
        }

        messageCount[chatId][userId] += 1;

        fs.writeFileSync(messageCountFile, JSON.stringify(messageCount), 'utf8');
    } catch (error) {
        console.error('Message count error:', error);
    }
});

bot.on('new_chat_members', (msg) => {
    if (!config.greetNewMembers || !config.greetNewMembers.enabled) return;

    const chatId = msg.chat.id;
    const newMembers = msg.new_chat_members;
    const gifUrl = config.greetNewMembers.gifUrl;

    newMembers.forEach(member => {
        const firstName = member.first_name;
        const lastName = member.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();

        const welcomeMessage = `👋 Welcome ${fullName}! Glad to have you here!`;

        bot.sendAnimation(chatId, gifUrl)
            .then(() => bot.sendMessage(chatId, welcomeMessage))
            .catch(error => bot.sendMessage(chatId, welcomeMessage));
    });
});

bot.on('new_chat_members', (msg) => {
    const chatId = msg.chat.id;
    if (!chatGroups.includes(chatId)) {
        chatGroups.push(chatId);
        fs.writeFileSync(chatGroupsFile, JSON.stringify(chatGroups, null, 2));
    }
});

bot.on('left_chat_member', (msg) => {
    const chatId = msg.chat.id;
    if (chatGroups.includes(chatId)) {
        chatGroups = chatGroups.filter(id => id !== chatId);
        fs.writeFileSync(chatGroupsFile, JSON.stringify(chatGroups, null, 2));
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    if (!chatGroups.includes(chatId)) {
        chatGroups.push(chatId);
        fs.writeFileSync(chatGroupsFile, JSON.stringify(chatGroups, null, 2));
    }
});

bot.on('polling_error', (error) => {
    console.error(gradient.passion('Polling error:', error.message));
});

function logger(message) {
    const gradientMessage = gradient.pastel(message);
    console.log(gradientMessage);
}

const botArt = `
╔═══════════════════════════════════╗
║     🟢 SAGOR TELEGRAM BOT 🔴     ║
╚═══════════════════════════════════╝
`;

logger(botArt);
logger(`✅ Bot started successfully!`);
logger(`📦 Loaded ${commands.length} commands`);
logger(`👑 Owner: ${config.owner_name}`);
logger(`🔗 Prefix: ${config.prefix}`);

if (config.autoUpdate && config.autoUpdate.enabled) {
    cron.schedule('*/10 * * * *', async () => {
        try {
            const response = await axios.get(`https://api.github.com/repos/${config.autoUpdate.repo}/commits`);
            const latestCommit = response.data[0];
            logger(`🔄 Checked for updates: ${latestCommit.commit.message}`);
        } catch (error) {
            // Silently fail
        }
    });
}

module.exports = bot;
