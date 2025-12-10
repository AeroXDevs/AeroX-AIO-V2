
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require('discord.js');

module.exports = {
  name: "ping",
  run: async (client, message, args) => {
    let start = Date.now();
    const [setResult, getResult, deleteResult] = await Promise.all([
      client.db4.set("latency-test", "test-value"),
      client.db4.get("latency-test"),
      client.db4.delete("latency-test"),
    ]);
    const dbLatency = Date.now() - start;
    start = Date.now();
    const msg = await message.channel.send({ content: 'Pinging...' });
    const editLatency = Date.now() - start;
    const messageLatency = Date.now() - message.createdTimestamp;
    const apiLatency = client.ws.ping;

    const container = new ContainerBuilder();
    
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("## Ping Statistics")
    );
    
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `<:dots:1428694502603751475> **Response Latency**: \`${messageLatency.toFixed(0)}ms\`\n<:dots:1428694502603751475> **Response Edit**: \`${editLatency.toFixed(0)}ms\`\n<:dots:1428694502603751475> **WebSocket Ping**: \`${apiLatency.toFixed(0)}ms\``
      )
    );

    await msg.delete();
    return message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
