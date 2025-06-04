const config = {
  slackToken: process.env.SLACK_BOT_TOKEN,
  slackSigningSecret: process.env.SLACK_SIGNING_SECRET,
  openaiAssistantId: process.env.OPENAI_ASSISTANT_ID,
  serverPort: process.env.PORT || 3000,
  openaiApiKey: process.env.OPENAI_API_KEY,
  reactionEmojis: process.env.REACTION_EMOJIS ? process.env.REACTION_EMOJIS.split(',') : [],
};

module.exports = config;
