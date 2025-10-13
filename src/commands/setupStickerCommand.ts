import { Telegraf, Context } from 'telegraf';
import { MESSAGE_TYPES, _sendMessage } from '../utils/sendMessage';

interface Sticker {
    name: string;
    id: string;
}

const stickers: Sticker[] = [
    {name: 'perplexed', id: 'CAACAgEAAxkBAAEEnnxgCP2MY2JGWC-2U9I_-OS-ovPZswACVwEAAkdFSUQ56uxEmLNyPh4E'},
    {name: 'blushedFanart', id: 'CAACAgEAAxkBAAEEnn5gCP2VKPphMQdLBkpnbovSMt5EtAACKwEAAsJvSURcv4WIUCt53R4E'},
    {name: 'epic', id: 'CAACAgEAAxkBAAEEnoBgCP2esjmXZ6MPohn62ojjoMGnXAAC8wADnplJRHDdXror4bPPHgQ'},
    {name: 'upset', id: 'CAACAgEAAxkBAAEEnoJgCP2k1ofenyNXaYDhip2G-kD9GAAC9QADTspJRAbJWAABnmlsVR4E'},
    {name: 'gekota', id: 'CAACAgEAAxkBAAEEnoRgCP2vrKmV00kdiFvUqdT3YV3nWQAC9gEAAiyZSEQnDFFwj_UjiR4E'},
    {name: 'blushingAnxious', id: 'CAACAgEAAxkBAAEEnoZgCP21rdzB8xnZ0ajH7ZD9CzSRngACWwEAAoTESETY-NagmRfzVx4E'},
    {name: 'confused', id: 'CAACAgEAAxkBAAEEnohgCP27lD9y2CAMdL5JQE8UVsvfcgACcgEAAgUxSUQh96FNkPU0kR4E'},
    {name: 'tsundere', id: 'CAACAgEAAxkBAAEEnopgCP3CE8yaTuDc3tncFTUyoVRf3AACywEAAqkESETpmdvf9ZJBHh4E'},
    {name: 'blushedAnxious2', id: 'CAACAgEAAxkBAAEEnoxgCP3HOYl1Kgu7fQJNonfq9VsILgACNwEAAlYYSUTUAyXoePMPZh4E'},
    {name: 'blushingDirect', id: 'CAACAgEAAxkBAAEEno5gCP3OU2fbFOM7z2c7JX9908CdPwACbAEAAhcRSETcoT6w_YxEih4E'},
];

export const setupStickerCommand = (bot: Telegraf<Context>) => {
  bot.command('sticker', (ctx) => {
    const args = ctx.message?.text?.split(' ') ?? [];
    const secondArg = args[1];

    if (secondArg) {
      if (secondArg === 'list') {
        _sendMessage(
          ctx,
          MESSAGE_TYPES.text,
          `List of stickers:\n${stickers.map((s) => `- ${s.name}`).join('\n')}`
        );
      } else {
        const foundSticker = stickers.find((s) => s.name === secondArg);
        if (!foundSticker) {
          _sendMessage(
            ctx,
            MESSAGE_TYPES.text,
            `Reaction not found, enter '/sticker list' for all sticker reactions.`
          );
        } else {
          _sendMessage(ctx, MESSAGE_TYPES.sticker, foundSticker.id);
        }
      }
    } else {
      // Random sticker
      const randomIndex = Math.floor(Math.random() * stickers.length);
      _sendMessage(ctx, MESSAGE_TYPES.sticker, stickers[randomIndex].id);
    }
  });
};