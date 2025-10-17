import { Telegraf, Context } from 'telegraf';
import { dataController, TableType } from './dataController';
import { _sendMessage, MESSAGE_TYPES } from './sendMessage';
import cron from 'node-cron';

// Generic birthday message
const DEFAULT_BIRTHDAY_MESSAGE = (userName: string) =>
  `🎉 Happy birthday, @${userName}! Hope you have an amazing day! 🥳`;

export const setupBirthdayChecker = async (bot: Telegraf<Context>) => {
  cron.schedule('0 9 * * *', async () => {
    console.log('[BirthdayChecker] Running daily birthday check...');
    await dataController.init();
    const allData = await dataController.readAll();

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const todayStr = `${day}/${month}`;

    for (const [chatId, chatData] of Object.entries(allData)) {
      const birthdays = chatData[TableType.BIRTHDAY];
      birthdays.forEach(async (b) => {
        if (b.date === todayStr) {
          const message = b.customMessage || DEFAULT_BIRTHDAY_MESSAGE(b.userName);
          try {
            const chatIdNumber = Number(chatId);
            await _sendMessage(
              {
                chat: { id: chatIdNumber },
              },
              MESSAGE_TYPES.text,
              message,
              { bot }
            );
          } catch (err) {
            console.error(`Failed to send birthday message to chat ${chatId}:`, err);
          }
        }
      });
    }
  });
};
