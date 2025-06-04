require('dotenv').config();

const {App} = require('@slack/bolt');
const config = require('./src/config');
const respondWithPersona = require('./src/respondWithPersona');

const app = new App({
  token: config.slackToken,
  signingSecret: config.slackSigningSecret,
});

app.event('app_mention', async ({event, client}) => {
  console.log('Processing mention', JSON.stringify(event));

  const content = event.text;

  await respondWithPersona({
    channel: event.channel,
    thread_ts: event.ts,
    content,
    client,
  });
});

app.event('reaction_added', async ({event, client}) => {
  console.log('Processing reaction', JSON.stringify(event));

  if (!config.reactionEmojis.includes(event.reaction)) {
    return;
  }

  const result = await client.conversations.history({
    channel: event.item.channel,
    latest: event.item.ts,
    limit: 1,
    inclusive: true,
  });

  const content = result.messages[0].text;

  await respondWithPersona({
    channel: event.item.channel,
    thread_ts: event.item.ts,
    content,
    client,
  });
});

// Start the app
(async () => {
  await app.start(config.serverPort);
  console.log('Slack bot is running!');
})();
