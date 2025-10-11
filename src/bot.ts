import {Context, Telegraf} from 'telegraf';
import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === "development" ? ".env.dev" : ".env",
});

import { helpCommand } from './commands/helpCommand';

const token = process.env.TOKEN;
if (!token) throw new Error("token is missing!");

const bot = new Telegraf<Context>(token);

helpCommand(bot);

bot.start((ctx) => ctx.reply("Hi I'm Misaka!"));

// Error handling
bot.catch((err: unknown, ctx: Context) => {
  console.error(`❌ Error for update type ${ctx.updateType}:`, err);
});

// Launch
bot.launch();
console.log("🚀 Bot is running...");

const handleSignal = (signal: string) => {
  console.log(`Received ${signal}, stopping bot...`);

  // Use .then/.catch so this callback returns void (not Promise<void>)
  bot.stop()
    .then(() => {
      console.log("Bot stopped cleanly");
      process.exit(0);
    })
    .catch((stopErr) => {
      console.error("Error while stopping bot:", stopErr);
      process.exit(1);
    });
};

// Register non-async listeners that return void — no TypeScript error
process.once("SIGINT", () => handleSignal("SIGINT"));
process.once("SIGTERM", () => handleSignal("SIGTERM"));