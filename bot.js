const {Telegraf} = require('telegraf');
const Jikan = require('jikan-node');

const mal = new Jikan();

const token = '1531381275:AAGkxWk7fzmNpDVMgzImbA0s-95W7cxtHVw';
const bot = new Telegraf(token);


bot.start((context) => {
    context.reply('Welcome');
});

bot.help((context) => {
    const help = [
        {command: '/start', description: `just 'Welcome' text.`},
        {command: '/help', description: `this fukin message.`},
        {command: '/season', description: `this seasonal's animes.`},
        {command: '/lefo', description: `LEFO.`},
        {command: '/image', description: `random image.`},
    ]
    context.reply(`What are you, stupid? Here's what I can do:\n${help.map((item) => `- ${item.command}: ${item.description}`).join('\n')}`)
})

bot.command('season', (context) => {
    context.reply('Okay, getting your seasonals...');
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const seasonString = () => {
        if (month >= 0 && month < 3) return 'winter';
        if (month >= 3 && month < 6) return 'spring';
        if (month >= 6 && month < 9) return 'summer';
        if (month >= 9 && month < 12) return 'fall';
        console.log('invalid month?');
        return 'invalid'
    };
    mal.findSeason(seasonString(), year)
        .then((info) => {
            context.reply(info.anime.slice(0, 9).map((anAnime) => `- ${anAnime.title} [Score: ${anAnime.score}].`).join('\n'));
            context.reply(`It's not like I made this list for you, b-baka!`);
        })
        .catch((error) => {console.log(error)});
});

bot.command('lefo', (context) => {
    context.replyWithHTML(`<b>LEFO</b>`)
})

// testing images things
let listenImages = true; let imageCount = 0;
bot.command('image', (context) => {
    if (listenImages) {
        if (imageCount === 0) {
            context.replyWithPhoto('https://picsum.photos/200/200/');
            imageCount = 1;
        } else {
            context.replyWithPhoto('https://picsum.photos/210/210/');            
            imageCount = 0;
        }
        listenImages = false;
        setTimeout(() => {listenImages = true}, 10000);
    }
});

const stickers = [
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
]
bot.command('sticker', (context) => {
    context.replyWithSticker(stickers[Math.floor(Math.random() * (stickers.length - 1) + 0)].id);
})

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
