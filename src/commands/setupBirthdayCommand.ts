import { Telegraf, Context } from 'telegraf';
import { dataController, TableType } from '../utils/dataController';
import { _sendMessage, MESSAGE_TYPES } from '../utils/sendMessage';

export const setupBirthdayCommand = (bot: Telegraf<Context>) => {
  // Helper to format birthdays
  const printBirthdays = async (ctx: Context) => {
    await dataController.init();
    const chatId = String(ctx.chat?.id);
    const birthdays = dataController.getTable(chatId, TableType.BIRTHDAY);

    if (birthdays.length === 0) {
      return _sendMessage(ctx, MESSAGE_TYPES.text, `No birthdays saved yet, baka.`);
    }

    const list = birthdays.map((b, i) => `- ${i}. Name: ${b.userName}, Date: ${b.date}`).join('\n');

    return _sendMessage(ctx, MESSAGE_TYPES.text, `All birthdays:\n${list}`);
  };

  bot.command('birthday', async (ctx) => {
    if (!ctx.message?.text.startsWith('/birthday')) return;
    const args = ctx.message?.text.split(' ') ?? [];
    const chatId = String(ctx.chat?.id);

    if (args.length === 1) return printBirthdays(ctx);

    const command = args[1].toLowerCase();

    switch (command) {
      case 'help':
        return _sendMessage(
          ctx,
          MESSAGE_TYPES.text,
          `
          '/birthday' options:

          - /birthday → lists all birthdays
          - /birthday me [dd/mm] → saves a new birthday
          - /birthday remove [number] → removes a birthday by its list index

          Example: /birthday me 02/05
        `
        );

      case 'me': {
        if (!ctx.from)
          return _sendMessage(ctx, MESSAGE_TYPES.text, `Cannot determine your user info.`);

        const date = args[2];
        if (!date) {
          return _sendMessage(
            ctx,
            MESSAGE_TYPES.text,
            `You must provide a date. Example: /birthday me 01/01`
          );
        }

        const [dayStr, monthStr] = date.split('/');
        const day = parseInt(dayStr);
        const month = parseInt(monthStr);
        const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (month < 1 || month > 12 || day < 1 || day > monthLength[month - 1]) {
          return _sendMessage(ctx, MESSAGE_TYPES.text, `The date does not exist.`);
        }

        const userId = String(ctx.from.id);
        const userName = ctx.from.username || ctx.from.first_name || 'unknown';

        await dataController.addBirthday(chatId, userId, userName, date);
        return printBirthdays(ctx);
      }

      case 'remove': {
        const index = parseInt(args[2]);
        if (isNaN(index)) {
          return _sendMessage(ctx, MESSAGE_TYPES.text, `Invalid number.`);
        }

        const birthdays = dataController.getTable(chatId, TableType.BIRTHDAY);
        if (index < 0 || index >= birthdays.length) {
          return _sendMessage(ctx, MESSAGE_TYPES.text, `Invalid number.`);
        }

        await dataController.remove(chatId, TableType.BIRTHDAY, (_, i) => i === index);
        return printBirthdays(ctx);
      }

      default:
        return _sendMessage(ctx, MESSAGE_TYPES.text, `Unknown subcommand. Try '/birthday help'.`);
    }
  });
};
