
# AeroX AIO V2 ✦

<div align="center">

**Elegant • Intelligent • Sophisticated**

A feature-rich Discord bot built with Discord.js v14 providing comprehensive server management, moderation, music streaming, anti-nuke protection, AI chat integration, and entertainment features.

</div>

---

## 📜 Credits

### Development Team
- **AeroX Development** - Original bot development and architecture
- **itsfizys** - Code modifications and enhancements

### Special Thanks
- **Team Kronix** - For providing the rare Rabbit code and granting permission to use it

---

## ✨ Features

### 🛡️ Anti-Nuke Protection
- Multi-layer security system against raids and malicious actions
- Protection against channel/role/emoji spam
- Auto-recovery system for server settings
- Whitelist and permission-based hierarchy
- Real-time monitoring of all critical server events

### 🎵 Music System
- High-quality music streaming via Lavalink
- YouTube search integration
- Interactive music controls with buttons
- Audio filters (8D, bass, nightcore, etc.)
- Queue management and loop functionality
- 24/7 music mode support

### 🤖 AI Chat Integration
- Powered by Groq API with llama-3.3-70b-versatile model
- Channel-based activation
- Smart message routing (commands take precedence)
- Natural conversation flow

### 🔨 Moderation Tools
- Ban, kick, mute, and timeout commands
- Channel management (lock, hide, nuke)
- Mass moderation actions (unbanall, lockall, etc.)
- Emoji and sticker stealing
- Advanced permission controls

### 🎮 Entertainment & Games
- 8ball, gay meter, dick size, and more
- Giveaway system with MongoDB backend
- Ticket system for support
- AFK status tracking
- Custom tag system

### ⚙️ Server Management
- Custom prefix per server
- Auto-role on member join
- Voice role assignments
- Welcome messages with customization
- Media-only channels
- Night mode role protection
- Sticky messages

### 📊 Utility Commands
- Server and user info
- Avatar, banner displays
- Bot statistics and uptime
- Embed builder
- Snipe deleted messages

---

## 🚀 Setup Guide

### Prerequisites
- Node.js v16.9.0 or higher
- A Discord Bot Token
- MongoDB database (for giveaways)
- Groq API key (for AI features)
- Lavalink server (default configured)

### Installation Steps

1. **Clone or Fork this Repl**
   - Click the "Fork" button at the top of this Repl

2. **Configure Bot Token**
   - Open `AeroX/config.json`
   - Add your Discord bot token:
   ```json
   {
     "token": "YOUR_BOT_TOKEN_HERE",
     "clientId": "YOUR_CLIENT_ID",
     "mongo": "YOUR_MONGODB_CONNECTION_STRING",
     "groqApiKey": "YOUR_GROQ_API_KEY"
   }
   ```

3. **Configure Developer Settings**
   - Open `AeroX/dev.json`
   - Add your Discord user ID to the `ownerIDS` array:
   ```json
   {
     "ownerIDS": ["YOUR_USER_ID_HERE"]
   }
   ```

4. **Install Dependencies**
   - Dependencies will auto-install on Replit
   - Or run manually: `npm install`

5. **Start the Bot**
   - Click the **Run** button
   - Wait for the startup sequence to complete
   - You should see: `✦ System Operational ✦`

### Optional Configuration

**Custom Prefix**
- Default prefix is `>`
- Change in `AeroX/settings.js` under `bot.info.prefix`

**Lavalink Server**
- Default server is pre-configured in `AeroX/index.js`
- To use your own Lavalink server, modify the `nodes` array

**MongoDB (for Giveaways)**
- Required only if using giveaway features
- Add connection string to `config.json`

**AI Chat (Groq)**
- Required only if using AI chat features
- Get free API key from [Groq](https://groq.com)
- Add to `config.json` as `groqApiKey`

---

## 📝 Usage

### Command Prefixes
- **Prefix Commands**: `>command` (customizable per server)
- **Slash Commands**: `/command`
- **Dokdo Debug**: `.dokdo` or `.jsk` (owner only)

### Essential Commands

**Moderation**
```
>ban @user [reason]
>kick @user [reason]
>mute @user [duration] [reason]
>clear [amount]
>lock / >unlock
```

**Anti-Nuke**
```
>antinuke [subcommand]
>nightmode [role] [add/remove/list]
>extra [owner/admin] [add/remove/list]
```

**Music**
```
/play [song name or URL]
/pause
/skip
/stop
/queue
/24-7 [enable/disable]
```

**AI Chat**
```
/ai-enable
/ai-disable
```

**Utility**
```
>help
>serverinfo
>userinfo [@user]
>avatar [@user]
>ping
```

---

## 🗂️ Project Structure

```
AeroX/
├── commands/          # Prefix-based commands
├── slashCommands/     # Slash commands
├── events/            # Event handlers
├── database/          # SQLite databases
├── handler/           # Command & event loaders
├── rabbit/            # Custom client (Rabbit code)
├── utils/             # Utility functions
├── config.json        # Bot configuration
├── dev.json           # Developer settings
└── index.js           # Main entry point
```

---

## 🛠️ Technology Stack

- **Discord.js v14** - Discord API wrapper with Components v2
- **QuickDB** - SQLite-based key-value storage
- **MongoDB + Mongoose** - Giveaway system
- **Kazagumo + Shoukaku** - Music streaming via Lavalink
- **Groq SDK** - AI chat integration
- **Canvafy** - Image generation for profiles
- **Dokdo** - Advanced debugging tools

---

## 🔒 Security Features

- Anti-nuke protection with auto-recovery
- Permission-based command restrictions
- Whitelist system for trusted users
- Audit log integration
- Rate limiting and cooldowns
- Secure token storage
- 
---

## 🤝 Support

Need help? Join our support server:
- **Support Server**: [https://discord.gg/8wfT8SfB5Z](https://discord.gg/8wfT8SfB5Z)

---

## 📄 License

This project is provided as-is for educational and personal use.

---

## ⚠️ Important Notes

1. **Keep your bot token secure** - Never share it publicly
2. **MongoDB is optional** - Only needed for giveaway features
3. **AI features require Groq API** - Free tier available
4. **Lavalink server included** - Default server is pre-configured
5. **Database files auto-create** - No manual setup needed

---

<div align="center">

**Made with ❤️ by AeroX Development**

*Modified by itsfizys*

*Special thanks to Team Kronix for the Rabbit code*

</div>
