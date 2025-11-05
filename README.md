#  Sagor Telegram Bot


## 🌟 Features

- ✨ **100+ Commands** - Comprehensive command suite ported from SaGor
- 🎯 **Smart Command System** - Prefix-based with cooldown support
- 👑 **Role-Based Access** - User, Admin, and Bot Owner permissions
- 🔄 **Auto-Update** - Automatic update checking from GitHub
- 📊 **Message Tracking** - Count messages per user/group
- 🎭 **Welcome System** - Greet new members with GIFs
- 🚫 **Global Ban Support** - Synchronized ban list
- ⚡ **Fast & Efficient** - Built with Node.js for performance

## 📋 Categories

- 🤖 **AI Commands** - Multiple AI chatbots and image generation
- 🎨 **Image/Video** - Photo editing, GIF creation, effects
- 🎵 **Music** - YouTube search, download, lyrics
- 🎮 **Games** - Fun interactive games
- 🛠️ **Utility** - Tools and helpful commands
- 👥 **Group Management** - Admin tools and moderation
- 📊 **Statistics** - Track usage and data
- 🎭 **Fun** - Entertainment and memes

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SAGOR-KINGx/TG-BOT.git
cd TG-BOT
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure the bot**
Create a `.env` file or edit `config.json`:

**Option 1: Using .env (Recommended)**
```bash
cp .env.example .env
# Edit .env with your bot token
```

**Option 2: Edit config.json**
```json
{
  "token": "YOUR_TELEGRAM_BOT_TOKEN",
  "prefix": "/",
  "owner_id": YOUR_TELEGRAM_USER_ID,
  "owner_name": "Your Name"
}
```

4. **Start the bot**
```bash
npm start
```

## ⚙️ Configuration

| Field | Description | Default |
|-------|-------------|---------|
| `token` | Telegram Bot Token | Required |
| `prefix` | Command prefix | `/` |
| `owner_id` | Bot owner's Telegram ID | Required |
| `owner_name` | Bot owner's name | Required |
| `bot_name` | Display name of bot | `Suika Bot` |
| `greetNewMembers.enabled` | Enable welcome messages | `true` |
| `autoUpdate.enabled` | Enable auto-update check | `true` |

## 📚 Command Usage

### Basic Commands
```
/help - Show all commands
/help <command> - Get info about specific command
/ai <query> - Chat with AI
/imagine <prompt> - Generate AI images
/ytb <query> - Search YouTube
```

### Admin Commands
```
/ban <user> - Ban a user (Admin only)
/clear - Clear chat messages (Admin only)
/adminonly - Toggle admin-only mode (Owner only)
```

## 🔧 Development

### Project Structure
```
sagor-tg-bot/
├── index.js          # Main entry point
├── main.js           # Bot logic
├── config.json       # Configuration
├── scripts/
│   └── cmds/         # Command files (180+)
├── public/           # Web interface
└── package.json      # Dependencies
```

### Creating Commands
```javascript
module.exports = {
  config: {
    name: 'commandname',
    description: 'Command description',
    category: 'Category',
    role: 0, // 0=User, 1=Admin, 2=Owner
    cooldown: 5,
    usePrefix: true
  },
  onStart: async ({ bot, chatId, args, msg }) => {
    // Command logic here
    await bot.sendMessage(chatId, 'Hello!');
  }
};
```