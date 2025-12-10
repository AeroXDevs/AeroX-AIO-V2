const { readdirSync } = require('fs');

module.exports = (client) => {
  let commandCount = loadCommands(client);
  let eventCount = loadEvents(client);
  
  const Colors = {
    BLUE: '\x1b[38;5;111m',
    GREEN: '\x1b[92m',
    RESET: '\x1b[0m'
  };
  
  console.log(`${Colors.BLUE}◆${Colors.RESET} ${Colors.GREEN}Loaded ${commandCount} commands${Colors.RESET}`);
  console.log(`${Colors.BLUE}◆${Colors.RESET} ${Colors.GREEN}Loaded ${eventCount} events${Colors.RESET}`);
};

function loadCommands(client) {
  let commandCount = 0;
  readdirSync('./commands/').forEach((dir) => {
    const commands = readdirSync(`./commands/${dir}/`).filter((file) => file.endsWith('.js'));
    commandCount += commands.length;
    for (let file of commands) {
      let pull = require(`../commands/${dir}/${file}`);
      if (pull.name) {
        client.commands.set(pull.name, pull);
      }
      if (pull.aliases && Array.isArray(pull.aliases)) {
        pull.aliases.forEach((alias) => client.aliases.set(alias, pull.name));
      }
    }
  });
  return commandCount;
}

function loadEvents(client) {
  let eventCount = 0;
  readdirSync('./events/').forEach((file) => {
    let pull = require(`../events/${file}`);
    if (pull.name) {
      client.events.set(pull.name, pull);
      eventCount++;
    }
  });
  return eventCount;
}
