import { Context, Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
});

import { _sendMessage, MESSAGE_TYPES } from './utils/sendMessage';

import { setupHelpCommand } from './commands/setupHelpCommand';
import { setupReactions } from './commands/setupReactions';
import { setupMiscCommands } from './commands/setupMiscCommands';
import { setupStickerCommand } from './commands/setupStickerCommand';
import { setupNhentaiCommand } from './commands/setupNhentaiCommand';
import { setupBirthdayCommand } from './commands/setupBirthdayCommand';
import { setupMbtiCommand } from './commands/setupMbtiCommand';
import { setupBirthdayChecker } from './utils/setupBirthdayChecker';

const token = process.env.TOKEN;
if (!token) throw new Error('token is missing!');

const bot = new Telegraf<Context>(token);

bot.command('ping', (ctx) => ctx.reply('pong'));

setupMbtiCommand(bot);
setupBirthdayCommand(bot);
setupNhentaiCommand(bot);
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
bot.launch();
console.log('🚀 Bot is running...');

const handleSignal = (signal: string) => {
  console.log(`Received ${signal}, stopping bot...`);

  // Use .then/.catch so this callback returns void (not Promise<void>)
  try {
    bot.stop();
    console.log('Bot stopped cleanly');
    process.exit(0);
  } catch (err: unknown) {
    console.error('Error while stopping bot:', err);
    process.exit(1);
  }
};

// Register non-async listeners that return void — no TypeScript error
process.once('SIGINT', () => handleSignal('SIGINT'));
process.once('SIGTERM', () => handleSignal('SIGTERM'));
