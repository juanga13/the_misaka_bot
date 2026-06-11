import { Context, Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
});

import { _sendMessage, MESSAGE_TYPES } from '../../src/utils/sendMessage';

import { setupHelpCommand } from '../../src/commands/setupHelpCommand';
import { setupReactions } from '../../src/commands/setupReactions';
import { setupMiscCommands } from '../../src/commands/setupMiscCommands';
import { setupStickerCommand } from '../../src/commands/setupStickerCommand';
import { setupNhentaiCommand } from '../../src/commands/setupNhentaiCommand';
import { setupSeasonCommand } from '../../src/commands/setupSeasonCommand';
import { setupBirthdayCommand } from '../../src/commands/setupBirthdayCommand';
import { setupMbtiCommand } from '../../src/commands/setupMbtiCommand';
import { setupBirthdayChecker } from '../../src/utils/setupBirthdayChecker';

import * as https from 'https';

const token = process.env.TOKEN;
if (!token) throw new Error('token is missing!');

const bot = new Telegraf<Context>(token, {
  telegram: {
    agent: new https.Agent({ family: 4 }),
  },
});

bot.command('ping', (ctx) => ctx.reply('pong'));

setupMbtiCommand(bot);
setupBirthdayCommand(bot);
setupNhentaiCommand(bot);
setupSeasonCommand(bot);
setupStickerCommand(bot);
setupMiscCommands(bot);
setupBirthdayChecker(bot);
setupHelpCommand(bot);
setupReactions(bot);

bot.start((ctx) => ctx.reply("Hi I'm Misaka!"));

// Error handling
bot.catch((err: unknown, ctx: Context) => {
  console.error(`❌ Error for update type ${ctx.updateType}:`, err);
});

// Launch
export const handler = async (event: any) => {
  // Telegram webhooks only send POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the incoming webhook payload from Telegram
    const body = JSON.parse(event.body || '{}');

    // Pass the payload into your Telegraf instance
    await bot.handleUpdate(body);

    // Acknowledge receipt to Telegram
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
