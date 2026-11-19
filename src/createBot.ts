import { Context, Telegraf } from 'telegraf';
import * as https from 'https';

import { setupHelpCommand } from './commands/setupHelpCommand';
import { setupReactions } from './commands/setupReactions';
import { setupMiscCommands } from './commands/setupMiscCommands';
import { setupStickerCommand } from './commands/setupStickerCommand';
import { setupNhentaiCommand } from './commands/setupNhentaiCommand';
import { setupSeasonCommand } from './commands/setupSeasonCommand';
import { setupBirthdayCommand } from './commands/setupBirthdayCommand';
import { setupMbtiCommand } from './commands/setupMbtiCommand';
import { setupBirthdayChecker } from './utils/setupBirthdayChecker';

/**
 * Builds the bot with every command registered.
 */
export const createBot = (): Telegraf<Context> => {
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

  bot.catch((err: unknown, ctx: Context) => {
    console.error(`❌ Error for update type ${ctx.updateType}:`, err);
  });

  return bot;
};
