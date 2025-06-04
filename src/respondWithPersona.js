const OpenAI = require('openai');
const config = require('./config');

async function responseWithPersona({channel, thread_ts, content, client}) {
  const prefix = `respondWithPersona:${channel}:${thread_ts}`;

  function log(message, method = 'debug') {
    console[method](`[${prefix}]: ${message}`);
  }

  const openai = new OpenAI();

  log(`Starting responseWithPersona for content: ${content}`);

  try {
    const messageThread = await openai.beta.threads.create({
      messages: [
        {
          role: 'user',
          content: content,
        },
      ],
    });

    log(`Thread created: ${messageThread.id}`);

    const newRun = await openai.beta.threads.runs.create(messageThread.id, {
      assistant_id: config.openaiAssistantId,
    });

    log(`Run triggered: ${newRun.id}`);

    let run;
    while (true) {
      run = await openai.beta.threads.runs.retrieve(newRun.id, {
        thread_id: newRun.thread_id,
      });

      log(`Run status: ${run.status}`);

      if (run.status === 'completed' || run.status === 'failed') {
        break;
      }
    }

    if (run.status === 'failed') {
      log(`=============================\rRun failed:`, run, '\n=============================');

      await client.chat.postMessage({
        channel,
        thread_ts,
        text: 'PersonaBot is busted right now. Try again later.',
      });

      return;
    }

    const threadMessages = await openai.beta.threads.messages.list(newRun.thread_id);

    const assistantResponse = threadMessages.data[0].content[0].text.value;

    log(`Assistant responded: ${assistantResponse}`);

    await client.chat.postMessage({
      channel,
      thread_ts,
      text: assistantResponse,
    });
  } catch (error) {
    log(`Error processing reaction: ${error.message}`, 'error');
  }
}

module.exports = responseWithPersona;
