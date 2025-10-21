import { Telegraf, Context } from 'telegraf';

type ReplyExtra = Parameters<Context['reply']>[1];

export enum MESSAGE_TYPES {
  text = 'text',
  html = 'html',
  sticker = 'sticker',
  photo = 'photo',
}

export interface SendMessageOptions {
  reply?: boolean;
  bot?: Telegraf<Context>;
}

export async function _sendMessage(
  ctxOrChat: Context | { chat: { id: number | string } },
  type: MESSAGE_TYPES,
  message: string,
  options?: SendMessageOptions
): Promise<void> {
  const shouldReply = options?.reply ?? false;
  const bot = options?.bot;

  try {
    const isCtx = 'reply' in ctxOrChat && typeof ctxOrChat.reply === 'function';

    if (isCtx) {
      const ctx = ctxOrChat as Context;
      switch (type) {
        case MESSAGE_TYPES.text:
          await ctx.reply(
            message,
            shouldReply && ctx.message?.message_id
              ? ({ reply_to_message_id: ctx.message.message_id } as ReplyExtra)
              : undefined
          );
          break;

        case MESSAGE_TYPES.html:
          await ctx.replyWithHTML(
            message,
            shouldReply && ctx.message?.message_id
              ? ({ reply_to_message_id: ctx.message.message_id } as ReplyExtra)
              : undefined
          );
          break;

        case MESSAGE_TYPES.sticker:
          await ctx.replyWithSticker(
            message,
            shouldReply && ctx.message?.message_id
              ? ({ reply_to_message_id: ctx.message.message_id } as ReplyExtra)
              : undefined
          );
          break;

        case MESSAGE_TYPES.photo:
          await ctx.replyWithPhoto(
            message,
            shouldReply && ctx.message?.message_id
              ? ({ reply_to_message_id: ctx.message.message_id } as ReplyExtra)
              : undefined
          );
          break;

        default:
          console.warn(`⚠️ Unknown message type: ${type}`);
          break;
      }
    } else {
      const chatId = ctxOrChat.chat?.id;
      if (!chatId) throw new Error('Chat ID missing in _sendMessage call.');

      if (!bot) throw new Error('Bot instance required when sending manually.');

      switch (type) {
        case MESSAGE_TYPES.text:
          await bot.telegram.sendMessage(chatId, message);
          break;
        case MESSAGE_TYPES.html:
          await bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
          break;
        case MESSAGE_TYPES.sticker:
          await bot.telegram.sendSticker(chatId, message);
          break;
        case MESSAGE_TYPES.photo:
          await bot.telegram.sendPhoto(chatId, message);
          break;
      }
    }
  } catch (error) {
    console.error('❌ Error sending message:', error);
    if ('reply' in ctxOrChat && typeof ctxOrChat.reply === 'function') {
      await ctxOrChat.reply('⚠️ Failed to send message.');
    }
  }
}
