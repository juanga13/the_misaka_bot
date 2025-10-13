import { Telegraf, Context } from "telegraf";
import { _sendMessage, MESSAGE_TYPES } from "../utils/sendMessage";

export const setupHelpCommand  = (bot: Telegraf<Context>) => {
  bot.help((ctx) => {
    const help = [
      { command: "/help", description: "this fukin message." },
      { command: "/season", description: "this seasonal's animes." },
      { command: "/lefo", description: "LEFO." },
      // { command: "/image", description: "random image." },
      { command: "/sticker [reaction]", description: "random sticker unless reaction is given. See '/sticker list' for every sticker." },
      { command: "/nhentai", description: "yyyyep." },
      { command: "/todo", description: "Todos list, show all actions with '/todo help'." },
      { command: "/birthday", description: "List of birthdays, show more actions with '/birthday help'." },
      { command: "/mbti", description: "Mbti menu, show more commands with '/mbti help'." },
    ];

    const helpText =
      `What are you, stupid? Here's what I can do:\n` +
      help.map((item) => `- ${item.command}: ${item.description}`).join("\n");

    _sendMessage(ctx, MESSAGE_TYPES.text, helpText);
  });
}