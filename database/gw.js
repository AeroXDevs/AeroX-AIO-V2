const mongoose = require('mongoose');

  const giveawaySchema = new mongoose.Schema({
      guildId: {
          type: String,
          required: true,
      },
      messageId: {
          type: String,
          required: true,
      },
      channelId: {
          type: String,
          required: true,
      },
      prize: {
          type: String,
          required: true,
      },
      winners: {
          type: Number,
          required: true,
      },
      endTime: {
          type: Date,
          required: true,
      },
      entries: {
          type: Map,
          of: Boolean,
          default: {},
      },
      joinedUsers: {
          type: String,
      },
  });


const Giveaway = mongoose.model('Giveaway', giveawaySchema);

module.exports = Giveaway;
