import { Telegraf, Context } from 'telegraf';
import { MESSAGE_TYPES, _sendMessage } from '../utils/sendMessage';

const telegrafGetChatMembers = require('telegraf-getchatmembers');

export const setupMiscCommands = (bot: Telegraf<Context>) => {

  bot.use(telegrafGetChatMembers);

  bot.command('lefo', async (ctx) => {
    await _sendMessage(ctx, MESSAGE_TYPES.text, 'LEFO')
  });
  bot.command('putaa', async (ctx: any) => {
    try {
      const members = await ctx.getChatMembers(ctx.chat.id);
      const allMembersCaps = members.map((m: any) => m.user.first_name.toUpperCase());

      const randomName = allMembersCaps[Math.floor(Math.random() * allMembersCaps.length)];
      await _sendMessage(ctx, MESSAGE_TYPES.html, `<b>${randomName}</b>`);
    } catch (error) {
      console.error('❌ Error in /putaa command:', error);
      await ctx.reply('⚠️ Failed to fetch members.');
    }
  });
};