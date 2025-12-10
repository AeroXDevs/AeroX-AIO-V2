const {
  Client,
  Partials,
  ActivityType,
  GatewayIntentBits,
  Options,
} = require("discord.js");
const Settings = require("../settings.js");

module.exports = class AeroXClient extends Client {
  constructor() {
    super({
      restTimeOffset: 2500,
      disableMentions: ["everyone", "here"],
      debugger: true,
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
      ],
      partials: [
        Partials.GuildMember,
        Partials.User,
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
      ],
      presence: {
        activities: [
          {
            name: `${Settings.bot.info.prefix}help`,
            type: ActivityType.Listening,
          },
        ],
        status: "idle",
        restRequestTimeout: 20000,
      },
      sweepers: {
        messages: {
          interval: 2,
          lifetime: 1,
          filter: () => (message) => message.id !== this.user.id,
        },
      },
      makeCache: Options.cacheWithLimits({
        ApplicationCommandManager: 5,
        BaseGuildEmojiManager: 5,
        GuildBanManager: 0,
        GuildInviteManager: 0,
        GuildManager: Infinity,
        GuildMemberManager: {
          maxSize: 200,
          keepOverLimit: (member) => member.id === this.user.id,
        },
        GuildStickerManager: 0,
        GuildScheduledEventManager: 0,
        MessageManager: 5,
        PresenceManager: 0,
        ReactionManager: 0,
        ReactionUserManager: 0,
        StageInstanceManager: 500,
        ThreadManager: 0,
        ThreadMemberManager: 0,
      }),
    });
  }
};
