const { ContainerBuilder, TextDisplayBuilder, SectionBuilder, MessageFlags } = require("discord.js");
const { inspect } = require("util");
const { EvalAccess } = require('../../dev.json');

module.exports = {
  name: "eval",
  BotPerms: ['EmbedLinks'],
  run: async (client, message, args) => {
    function isBotOwner(user) {
      return EvalAccess.includes(user.id);
    }

    async function evaluateCode(code) {
      try {
        const asyncWrapper = eval(`(async () => { return ${code} })();`);
        const evaled = await asyncWrapper;
        if (typeof evaled !== "string") {
          return inspect(evaled, { depth: 0 });
        }
        return evaled;
      } catch (err) {
        return err;
      }
    }

    async function createEvalContainer(message, code, output) {
      const container = new ContainerBuilder()
        .setAccentColor(client.color || 0x5865F2);

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${message.author.tag}**`)
      );

      container.addSectionComponents(
        new SectionBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent('**Input**'),
          new TextDisplayBuilder().setContent(`\`\`\`js\n${code}\n\`\`\``)
        )
      );

      container.addSectionComponents(
        new SectionBuilder().addTextDisplayComponents(
          new TextDisplayBuilder().setContent('**Output**'),
          new TextDisplayBuilder().setContent(`\`\`\`js\n${output}\n\`\`\``)
        )
      );

      await message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    if (!isBotOwner(message.author)) {
      return message.channel.send("This command is limited to the bot owner only!");
    }

    const code = args.join(" ");
    if (!code) {
      return message.channel.send("Please provide code to evaluate.");
    }

    const output = await evaluateCode(code);
    await createEvalContainer(message, code, output);
  },
};
