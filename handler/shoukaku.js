const { readdirSync } = require("fs");

module.exports = async (client) => {
    try {
        readdirSync("./shoukaku").forEach(file => {
            const event = require(`../shoukaku/${file}`);
            let eventName = file.split(".")[0];
            client.manager.on(eventName, event.bind(null, client));
            console.log('[shoukaku] loaded event: ' + eventName)
        });
    } catch (e) {
      
    }
};