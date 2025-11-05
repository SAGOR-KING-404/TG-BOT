/**
 * Telegram API Adapter for Messenger-style commands
 * This provides compatibility with Messenger bot API structure
 */

class TelegramAdapter {
    constructor(bot) {
        this.bot = bot;
    }

    // Messenger-compatible sendMessage
    sendMessage(message, threadID, messageID, callback) {
        if (typeof message === 'object') {
            // Handle {body: "text", attachment: stream}
            const text = message.body || '';
            const attachment = message.attachment;
            
            if (attachment) {
                return this.bot.sendPhoto(threadID, attachment, { caption: text });
            }
            return this.bot.sendMessage(threadID, text);
        }
        
        // Simple text message
        return this.bot.sendMessage(threadID, message);
    }

    // Unsend message (Telegram uses deleteMessage)
    unsendMessage(messageID, callback) {
        // Telegram doesn't support unsending others' messages easily
        // This is a no-op for compatibility
        if (callback) callback(null);
        return Promise.resolve();
    }

    // Get current user ID (bot's ID)
    getCurrentUserID() {
        return this.bot._id || 'bot';
    }

    // Change thread/chat name
    setTitle(threadID, title, callback) {
        return this.bot.setChatTitle(threadID, title).then(() => {
            if (callback) callback(null);
        }).catch(err => {
            if (callback) callback(err);
        });
    }

    // Get thread/chat info
    getThreadInfo(threadID, callback) {
        return this.bot.getChat(threadID).then(chat => {
            const info = {
                threadID: chat.id,
                threadName: chat.title || chat.first_name,
                participantIDs: [],
                userInfo: [],
                adminIDs: [],
                isGroup: chat.type === 'group' || chat.type === 'supergroup'
            };
            if (callback) callback(null, info);
            return info;
        }).catch(err => {
            if (callback) callback(err);
            throw err;
        });
    }

    // Get user info
    getUserInfo(userID, callback) {
        // Telegram doesn't have direct user info API
        // Return minimal info
        const info = {
            [userID]: {
                name: 'User',
                firstName: 'User',
                vanity: userID.toString(),
                thumbSrc: '',
                profileUrl: '',
                gender: 'Unknown',
                type: 'user',
                isFriend: false,
                isBirthday: false
            }
        };
        if (callback) callback(null, info);
        return Promise.resolve(info);
    }

    // React to message
    setMessageReaction(reaction, messageID, callback, isReact) {
        // Telegram doesn't support reactions via bot API easily
        // This is a no-op for compatibility
        if (callback) callback(null);
        return Promise.resolve();
    }

    // Send typing indicator
    sendTypingIndicator(threadID, callback) {
        return this.bot.sendChatAction(threadID, 'typing').then(() => {
            if (callback) callback(null);
        }).catch(err => {
            if (callback) callback(err);
        });
    }

    // HTTP utilities
    httpGet(url, callback) {
        const axios = require('axios');
        return axios.get(url).then(response => {
            if (callback) callback(null, response.data);
            return response.data;
        }).catch(err => {
            if (callback) callback(err);
            throw err;
        });
    }

    httpPost(url, data, callback) {
        const axios = require('axios');
        return axios.post(url, data).then(response => {
            if (callback) callback(null, response.data);
            return response.data;
        }).catch(err => {
            if (callback) callback(err);
            throw err;
        });
    }
}

module.exports = TelegramAdapter;
