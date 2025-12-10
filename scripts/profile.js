const { CV2Helper } = require("../../utils/cv2.js");
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ThumbnailBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  AttachmentBuilder,
} = require("discord.js");
const { Profile: CanvafyProfile } = require("canvafy");

const Badge = require("../../schema/badge");
const axios = require("axios");
const VoteBypassUserModel = require("../../schema/votebypassuser");
const noprefix = require("../../schema/noprefix");
const Profile = require("../../schema/profile");

module.exports = {
  name: "profile",
  category: "Information",
  aliases: ["pr", "badges", "badge", "bdg"],
  description: "View your or someone else's profile.",
  botPerms: ["EmbedLinks"],
  cooldown: 3,
  execute: async (message, args, client, prefix, player, guildData) => {
    const ozuma = await client.users.cache.get(`${client.owner}`);
    const user = message.mentions.users.first() || message.author;

    let bannerUrl = null;
    let discordUserData = null;
    try {
      const { data } = await axios.get(
        `https://discord.com/api/users/${user.id}`,
        {
          headers: { Authorization: `Bot ${client.token}` },
        },
      );
      discordUserData = data;
      if (data.banner) {
        const ext = data.banner.startsWith("a_") ? ".gif" : ".png";
        bannerUrl = `https://cdn.discordapp.com/banners/${user.id}/${data.banner}${ext}?size=4096`;
      } else {
        bannerUrl =
          "https://cdn.discordapp.com/banners/1033496708992204840/ab50e5bfe369c1a669c67529589956a0.png?size=4096";
      }
    } catch (err) {
      console.error("Failed to fetch user banner:", err);
    }
    
    const profileCard = new CanvafyProfile()
      .setUser(user.id)
      .setBorder("#c3a7df");

    
    if (user.presence?.activities && user.presence.activities.length > 0) {
      const activity = user.presence.activities[0];
      profileCard.setActivity({
        activity,
        largeImage: activity.assets?.largeImage
      });
    }

    let image;
    let attachment;
    
    try {
      image = await profileCard.build();
      attachment = new AttachmentBuilder(image, { name: "profile.png" });
      console.log("Profile card generated successfully");
    } catch (error) {
      console.error("Error generating profile card:", error);
      
      const errorEmbed = new client.embed()
        .setDescription(`❌ Failed to generate profile card: ${error.message}`)
        .setColor("#FF0000");
      return message.channel.send({ embeds: [errorEmbed] });
    }
    const main = new client.embed().setImage("attachment://profile.png");
    const cache = [];
    let data = await Badge.findOne({ userId: user.id });
    if (!data) data = await Badge.create({ userId: user.id });

    let guild = null;
    let sus = null;
    
    try {
      guild = await client.guilds.fetch(client.config.links.guild);
      sus = await guild.members.fetch(user.id);
    } catch (e) {
      console.log(`User ${user.username} not found in support server, continuing with basic profile...`);
    }

    const Dev = sus?.roles.cache.has(`1329059180232966235`) || false;
    const Cometusers = sus?.roles.cache.has(`1329059243348852757`) || false;

    if (Dev) cache.push(`> ${client.emoji.ozuma} **Ozuma**`);
    if (data.badge.dev) cache.push(`> ${client.emoji.dev} **Bot Developer**`);
    if (data.badge.web) cache.push(`> ${client.emoji.web} **Web Developer**`);
    if (data.badge.owner) cache.push(`> ${client.emoji.owner} **Owner**`);
    if (data.badge.admin) cache.push(`> ${client.emoji.admin} **Admin**`);
    if (data.badge.staff) cache.push(`> ${client.emoji.staff} **Staff**`);
    if (data.badge.partner) cache.push(`> ${client.emoji.partner} **Partner**`);
    if (data.badge.supporter)
      cache.push(`> ${client.emoji.supporter} **Bot's Early Supporter**`);
    if (data.badge.sponsor) cache.push(`> ${client.emoji.sponsor} **Sponsor**`);
    if (data.badge.ownerspecial)
      cache.push(`> ${client.emoji.ownerspecial} **Owner's Special**`);
    if (data.badge.specialone)
      cache.push(`> ${client.emoji.specialone} **Special One's**`);
    if (data.badge.loveone)
      cache.push(`> ${client.emoji.loveone} **Love One's**`);
    if (data.badge.vip) cache.push(`> ${client.emoji.vip} **Vip**`);
    if (data.badge.friend) cache.push(`> ${client.emoji.friend} **Friend**`);
    if (data.badge.bug) cache.push(`> ${client.emoji.bug} **Bug Hunter**`);
    if (data.badge.noprefix)
      cache.push(`> ${client.emoji.noprefix} **No Prefix**`);
    if (Cometusers) cache.push(`> <:Fams:1199282541413277726> **Users**`);

    if (cache.length === 0)
      cache.push(`Oops! **${user.username}** doesn't have any badges.`);

    const voteBypassUser = await VoteBypassUserModel.findOne({
      userId: user.id,
    });
    const noprefixData = await noprefix.findOne({ userId: user.id });
    const userProfile = await Profile.findOne({ User: user.id });

    const ozuuu = await client.owner;
    let primeBadge = "";

    if (voteBypassUser)
      primeBadge += `> **VotebyPass** - <a:enable:1209209294185300010>\n`;
    if (!voteBypassUser)
      primeBadge += `> **VotebyPass** - <:disable:1209209238065385532>\n`;

    
    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# ${user.displayName || user.username}'s Profile`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL("attachment://profile.png")
            .setDescription('User Profile Card')
        )
      );

    
    await CV2Helper.sendMessage(message.channel, [container], [attachment]);
  },
};