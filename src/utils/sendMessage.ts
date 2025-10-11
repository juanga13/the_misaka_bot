import { Context } from "telegraf";

export enum MESSAGE_TYPES {
  text = "text",
  html = "html",
  sticker = "sticker",
  photo = "photo",
}

export interface SendMessageOptions {
  reply?: boolean;
}

export async function _sendMessage(
  ctx: Context,
  type: MESSAGE_TYPES,
  message: string,
  options?: SendMessageOptions
): Promise<void> {
  const shouldReply = options?.reply ?? false;

  try {
    switch (type) {
      case MESSAGE_TYPES.text:
        await ctx.reply(message, shouldReply ? { reply_to_message_id: ctx.message?.message_id } : undefined);
        break;

      case MESSAGE_TYPES.html:
        await ctx.replyWithHTML(message, shouldReply ? { reply_to_message_id: ctx.message?.message_id } : undefined);
        break;

      case MESSAGE_TYPES.sticker:
        await ctx.replyWithSticker(message, shouldReply ? { reply_to_message_id: ctx.message?.message_id } : undefined);
        break;

      case MESSAGE_TYPES.photo:
        await ctx.replyWithPhoto(message, shouldReply ? { reply_to_message_id: ctx.message?.message_id } : undefined);
        break;

      default:
        console.warn(`⚠️ Unknown message type: ${type}`);
        break;
    }
  } catch (error) {
    console.error("❌ Error sending message:", error);
    await ctx.reply("⚠️ Failed to send message.");
  }
}