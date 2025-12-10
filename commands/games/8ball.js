const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const emoji = require("../../emoji.js");

module.exports = {
  name: "8ball",
  description: "Ask the magic 8ball a question and receive a fortune",
  aliases: ["fortune", "predict"],
  run: async (client, message, args) => {
    if (args.length === 0) {
      const container = new ContainerBuilder();
      
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🎱 Magic 8Ball`)
      );
      
      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );
      
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${emoji.util.cross} You need to ask a question!\n\n**Usage:** \`8ball <question>\``
        )
      );
      
      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    const fortunes = [
      "Yes.",
      "It is certain.",
      "It is decidedly so.",
      "Without a doubt.",
      "Yes definitely.",
      "You may rely on it.",
      "As I see it, yes.",
      "Most likely.",
      "Outlook good.",
      "Signs point to yes.",
      "Reply hazy, try again.",
      "Ask again later.",
      "Better not tell you now...",
      "Cannot predict now.",
      "Concentrate and ask again.",
      "Don't count on it.",
      "My reply is no.",
      "My sources say no.",
      "Outlook not so good...",
      "Very doubtful.",
      "Absolutely!",
      "Certainly!",
      "It's a possibility.",
      "Highly likely.",
      "It's in the cards.",
      "You're on the right track.",
      "Definitely.",
      "For sure!",
      "It's a sure thing.",
      "Undoubtedly.",
      "Absolutely not.",
      "No way!",
      "Forget about it.",
      "Not a chance.",
      "I wouldn't bet on it.",
      "Nope.",
      "Sorry, but no.",
      "The outlook is grim.",
      "Chances are slim.",
      "Don't get your hopes up.",
      "Unlikely.",
      "It's improbable.",
      "You might want to reconsider.",
      "The answer is unclear.",
      "Try again later.",
      "I'm not certain.",
      "I have my doubts.",
      "It's a mystery.",
      "I'm stumped.",
      "I'm not sure.",
      "I'm drawing a blank.",
      "Ask someone else.",
      "Seek advice from a friend.",
      "Trust your instincts.",
      "Listen to your heart.",
      "Follow your dreams.",
      "Explore new possibilities.",
      "Embrace change.",
      "Take a leap of faith.",
      "Choose the path less traveled.",
      "Be patient.",
      "Stay positive.",
      "Stay optimistic.",
      "Stay focused.",
      "Stay determined.",
      "Stay true to yourself.",
      "Believe in yourself.",
      "You've got this!",
      "You can do it!",
      "You're stronger than you think.",
      "Don't give up.",
      "Keep pushing forward.",
      "Keep moving forward.",
      "Success is within reach.",
      "Good things are coming your way.",
      "Stay hopeful.",
      "Stay motivated.",
      "Stay inspired.",
      "Stay confident.",
      "Stay grounded.",
      "Stay humble.",
      "Stay kind.",
      "Stay grateful.",
    ];

    const answer = fortunes[Math.floor(Math.random() * fortunes.length)];
    const question = args.join(" ");

    const container = new ContainerBuilder();

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`# 🎱 Magic 8Ball`)
    );

    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## Your Question"),
      new TextDisplayBuilder().setContent(`*"${question}"*`)
    );

    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## The 8Ball Says"),
      new TextDisplayBuilder().setContent(`**${answer}**`)
    );

    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large)
        .setDivider(true)
    );

    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${emoji.util.arrow} Asked by **${message.author.username}**`
      )
    );

    await message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
