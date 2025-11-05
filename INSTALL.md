# 📥 Installation Guide

## Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** v7.0.0 or higher
- **Telegram Bot Token** from [@BotFather](https://t.me/BotFather)

## Quick Start

### 1. Get Your Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token provided

### 2. Clone and Install

```bash
# Clone the repository
git clone https://github.com/Gtajisan/suika-tg-bot.git
cd suika-tg-bot

# Install dependencies
npm install
```

### 3. Configure Your Bot

**Method 1: Using Environment Variables (Recommended)**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your token
nano .env  # or use any text editor
```

**Method 2: Edit config.json**
```bash
# Edit config.json
nano config.json

# Replace the placeholder values:
{
  "token": "YOUR_BOT_TOKEN_HERE",
  "prefix": "/",
  "owner_id": YOUR_TELEGRAM_USER_ID,
  "owner_name": "Your Name"
}
```

### 4. Get Your Telegram User ID

Send any message to [@userinfobot](https://t.me/userinfobot) on Telegram to get your user ID.

### 5. Start the Bot

```bash
npm start
```

You should see:
```
╔═══════════════════════════════════╗
║     🟢 SAGOR TELEGRAM BOT 🔴     ║
╚═══════════════════════════════════╝
✅ Bot started successfully!
📦 Loaded 150+ commands
👑 Owner: Your Name
🔗 Prefix: /
```

### 6. Test Your Bot

1. Open Telegram
2. Search for your bot
3. Send `/help` to see all commands
4. Try `/ai Hello!` to test AI features

## Deployment Options

### Deploy on Replit

1. Fork this repl or import from GitHub
2. Add your bot token in Secrets (key: `TELEGRAM_BOT_TOKEN`)
3. Click Run

### Deploy on Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create new Heroku app
heroku create your-bot-name

# Set environment variables
heroku config:set TELEGRAM_BOT_TOKEN=your_token_here

# Deploy
git push heroku main
```

### Deploy on VPS/Server

```bash
# Install PM2 for process management
npm install -g pm2

# Start bot with PM2
pm2 start index.js --name suika-bot

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

## Troubleshooting

### Bot not responding?
- Check if your token is correct
- Verify the bot is running (`pm2 status` or check console)
- Ensure firewall allows outgoing connections

### Commands not working?
- Make sure you're using the correct prefix (default: `/`)
- Check if you have required permissions (some commands are admin-only)

### Polling errors?
- Token might be invalid or expired
- Another instance might be using the same token
- Check your internet connection

## Support

- 📱 Telegram: [@xxSaGorxx](https://t.me/xxSaGorxx)
- 🐛 Issues: [GitHub Issues](https://github.com/SAGOR-KINGx/TG-BOT/issues)
- 📧 Email: jahidullx6@gmail.com
