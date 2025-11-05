const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

global.utils = {
    getPrefix: (threadID) => {
        const config = require('./config.json');
        return config.prefix || '/';
    },
    
    findUid: async (query) => {
        return null;
    },
    
    getStreamFromURL: async (url) => {
        try {
            const response = await axios({
                method: 'get',
                url: url,
                responseType: 'stream'
            });
            return response.data;
        } catch (error) {
            return null;
        }
    },
    
    getStreamsFromAttachment: async (attachments) => {
        return [];
    },
    
    shortenURL: async (url) => {
        return url;
    },
    
    randomString: (length) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    getTime: (format) => {
        const now = new Date();
        return now.toLocaleString();
    },
    
    removeHomeDir: (str) => {
        return str.replace(/\/home\/[^\/]+/g, '~');
    },
    
    getExtFromUrl: (url) => {
        const match = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
        return match ? match[1] : '';
    },
    
    drive: {
        uploadFile: async () => null,
        deleteFile: async () => null
    },
    
    GoatBotApis: {
        textToImage: async () => null
    }
};

global.GoatBot = {
    config: require('./config.json'),
    configCommands: {},
    commands: new Map(),
    aliases: new Map(),
    onChat: [],
    onReply: new Map(),
    onReaction: new Map(),
    envGlobal: {}
};

global.db = {
    allThreadData: [],
    allUserData: [],
    threadsData: null,
    usersData: null,
    sequelize: null
};

module.exports = global.utils;
