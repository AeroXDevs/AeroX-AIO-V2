const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const emoji = require('../../emoji.js');

module.exports = {
    name: 'stickyPoster',
    execute: async (client) => {
        
        
        console.log('Sticky message system loaded - messages will be posted on channel activity');
    }
};
