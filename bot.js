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
// bot.on('text', (context) => {
//     const animes = [
//         'Shingeki no Kyojin: The Final Season',
//         'Yakusoku no Neverland 2nd Season',
//         'Dr. Stone: Stone Wars',
//         'Tensei shitara Slime Datta Ken 2nd Season',
//         'Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season Part 2',
//         'Horimiya',
//         '5-toubun no Hanayome ∬',
//         'Mushoku Tensei: Isekai Ittara Honki Dasu',
//         'Beastars 2nd Season',
//     ];
//     context.reply(animes.map((anime) => `- ${anime}.`).join('\n'));
// })
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

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
