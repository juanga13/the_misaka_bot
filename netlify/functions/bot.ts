import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
});

import { createBot } from '../../src/createBot';

const bot = createBot();

// Launch
export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    let body;

    // Check if the body is URL-encoded or raw JSON
    if (
      event.headers['content-type'] === 'application/x-www-form-urlencoded' ||
      (event.body && event.body.startsWith('user_id='))
    ) {
      // Convert url-encoded string to a usable object
      const params = new URLSearchParams(event.body);
      body = Object.fromEntries(params.entries());
    } else {
      // Default to JSON parsing
      body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    }

    // Pass the parsed payload into your Telegraf instance
    await bot.handleUpdate(body);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Update processed successfully' }),
    };
  } catch (err: unknown) {
    console.error('Error handling webhook:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
