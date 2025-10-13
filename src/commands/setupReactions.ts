import {Telegraf, Context} from "telegraf";
import { _sendMessage, MESSAGE_TYPES } from "../utils/sendMessage";

interface Reaction {
    keyword: RegExp | string;
    isRegex?: boolean;
    type: MESSAGE_TYPES;
    message: string | ((msg: string) => string);
    options?: {reply?: boolean};
    isFunction?: boolean;
}

const reactions: Reaction[] = [
    {
        keyword: /^(a{5})+/,
        isRegex: true,
        type: MESSAGE_TYPES.text,
        message: (msg) => msg + 'A'.repeat(Math.floor(Math.random() * msg.length)),
        isFunction: true,
    },
    {
        keyword: /(8|ocho)$/,
        isRegex: true,
        type: MESSAGE_TYPES.text,
        message: 'El culo te abrocho',
        options: { reply: true },
    },
    {
        keyword: /(9|nueve)$/,
        isRegex: true,
        type: MESSAGE_TYPES.text,
        message: 'El culo te llueve',
        options: { reply: true },
    },
];

export const setupReactions = (bot: Telegraf<Context>) => {
  bot.on('text', (ctx: Context) => {
    if (!ctx.message || !('text' in ctx.message)) return;    
    const msg = ctx.message.text.toLowerCase();

    const reaction = reactions.find((r) =>
      r.isRegex && r.keyword instanceof RegExp ? r.keyword.test(msg) : msg === r.keyword
    );
    if (!reaction) return;

    const message =
      typeof reaction.message === 'function' ? reaction.message(msg) : reaction.message;

    _sendMessage(ctx, reaction.type, message, reaction.options);
  });
};