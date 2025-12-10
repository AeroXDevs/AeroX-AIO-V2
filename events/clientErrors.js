const { WebhookClient } = require("discord.js");
const client = require("../index.js");
const config = require("../config.json");

const webhookUrl = config.webhook;
const webhookClient = new WebhookClient({ url: webhookUrl });

client.on("error", (error) => {
  console.log(error);
});

process.on("uncaughtException", (error) => {
  console.log(error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log(reason);
});













