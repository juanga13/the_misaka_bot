import { Telegraf, Context } from 'telegraf';
import { MESSAGE_TYPES, _sendMessage } from '../utils/sendMessage';

export const setupNhentaiCommand = (bot: Telegraf<Context>) => {
  bot.command('nhentai', async (ctx) => {
    let magicNumbers = '';
    [0, 1, 2, 3, 4, 5].forEach(() => (magicNumbers += Math.floor(Math.random() * 9)));
    const url = `https://nhentai.net/g/${magicNumbers}`;
    try {
      const response = await fetch(url, { method: 'HEAD' }); // HEAD request is enough to check if it exists
      if (response.ok) {
        await _sendMessage(ctx, MESSAGE_TYPES.text, url);
      } else if (response.status === 404) {
        await _sendMessage(
          ctx,
          MESSAGE_TYPES.text,
          `Tch! What are you even looking for?! That code ${magicNumbers} doesn't exist, baka! 🙄` +
            ` Hmph... I-I’m not saying I care if you find one, okay?!`
        );
      } else {
        await _sendMessage(
          ctx,
          MESSAGE_TYPES.text,
          `Received unexpected status: ${response.status}`
        );
      }
    } catch (err) {
      console.error(err);
      await _sendMessage(ctx, MESSAGE_TYPES.text, 'Something went wrong while checking the link.');
    }
  });
};
