import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env',
});

import { createBot } from './createBot';

// Long-polling entry point, for always-on hosts (Docker on Unraid, systemd, etc).
// Note: launch() removes any webhook set on the token (e.g. the Netlify one).
const bot = createBot();

bot.launch();
console.log('🚀 Bot is running...');

const handleSignal = (signal: string) => {
  console.log(`Received ${signal}, stopping bot...`);
  try {
    bot.stop(signal);
    console.log('Bot stopped cleanly');
    process.exit(0);
  } catch (err: unknown) {
    console.error('Error while stopping bot:', err);
    process.exit(1);
  }
};

process.once('SIGINT', () => handleSignal('SIGINT'));
process.once('SIGTERM', () => handleSignal('SIGTERM'));
