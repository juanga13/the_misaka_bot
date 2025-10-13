import { Telegraf, Context } from 'telegraf';
import { MESSAGE_TYPES, _sendMessage } from '../utils/sendMessage';

export const setupNhentaiCommand = (bot: Telegraf<Context>) => {
    bot.command('nhentai', (context) => {
        let magicNumbers = '';
        [0, 1, 2, 3, 4, 5].forEach(() => magicNumbers += Math.floor(Math.random() * 9));
        // console.log(magicNumbers.toString());
        _sendMessage(context, MESSAGE_TYPES.text, `https://nhentai.net/g/${magicNumbers}`);
    });
}