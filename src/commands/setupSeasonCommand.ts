import { Telegraf, Context } from 'telegraf';
import fetch from 'node-fetch';
import * as https from 'https';
import { _sendMessage, MESSAGE_TYPES } from '../utils/sendMessage';

const jikanUrl = 'https://api.jikan.moe/v4/seasons';

export const setupSeasonCommand = (bot: Telegraf<Context>) => {
  bot.command('season', async (ctx) => {
    await _sendMessage(ctx, MESSAGE_TYPES.text, 'Okay, getting your seasonals...');
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const seasonString = () => {
      if (month >= 0 && month < 3) return 'winter';
      if (month >= 3 && month < 6) return 'spring';
      if (month >= 6 && month < 9) return 'summer';
      if (month >= 9 && month < 12) return 'fall';
      return 'invalid';
    };

    const season = seasonString();

    try {
      await _sendMessage(ctx, MESSAGE_TYPES.text, `Fetching ${season} ${year} anime...`);
      const agent = new https.Agent({ family: 4 });
      const res = await fetch(`${jikanUrl}/${year}/${season}`, { agent });
      const json: any = await res.json();
      const list = json.data
        .slice(0, 9)
        .map((a: any) => `- ${a.title} [Score: ${a.score ?? 'N/A'}]`)
        .join('\n');

      await _sendMessage(ctx, MESSAGE_TYPES.text, list);
      await _sendMessage(
        ctx,
        MESSAGE_TYPES.text,
        `It's not like I made this list for you, b-baka!`
      );
    } catch (err) {
      console.error(err);
      await _sendMessage(ctx, MESSAGE_TYPES.text, "Couldn't fetch seasonal data 😢");
    }
  });
};
