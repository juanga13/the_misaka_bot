/* deps */
const {Telegraf} = require('telegraf');
const Extra = require('telegraf/extra');
const Jikan = require('jikan-node');
const dotenv = require('dotenv');
dotenv.config();

/* instances */
const token = process.env.TOKEN;
const mal = new Jikan();
const bot = new Telegraf(token);
const {WHITELIST_IDS} = require('./whitelist');

/**
 * TODO: commented because using it in other thing, uncomment!
 * Simple message for when start using the bot, maybe add
 * some checks for being just a first time only thing (the
 * welcome message i mean)
 */
// bot.start((context) => {
//     context.reply('Hi I'm Misaka!');
// });

bot.help((context) => {
    const help = [
        {command: '/start', description: `just 'Welcome' text.`},
        {command: '/help', description: `this fukin message.`},
        {command: '/season', description: `this seasonal's animes.`},
        {command: '/lefo', description: `LEFO.`},
        {command: '/image', description: `random image.`},
        {command: '/sticker [reaction]', description: `random sticker unless reaction is given, See '/sticker list' for every sticker.`},
        {command: '/nhentai', description: `yyyyep.`},
    ];
    _sendMessage(context, MESSAGE_TYPES.text, `What are you, stupid? Here's what I can do:\n${help.map((item) => `- ${item.command}: ${item.description}`).join('\n')}`)
})

/**
 * The only useful command actually.
 * 
 * First version of seasonal sender, it asks from an MAL api
 * data of animes and related stuff and replies it in a 
 * tsundere way... I know I know.
 * 
 * Todo list
 *  - instance suscribable anime selection
 *    - /anime suscribe shingeki -> search for anime with "shingeki"
 *    - show search results (5 results should be good)
 *    - user could click (HTML) on selection or just /select [1-5]
 *    - anime id will be saved 
 *  - extend to interval command
 *  - use suscriptions list to message things ideas:
 *    - interval check new chapter and if it has, notify it
 *    - anime news
 */
bot.command('season', (context) => {
    _sendMessage(context, MESSAGE_TYPES.text, 'Okay, getting your seasonals...');
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
            _sendMessage(context, MESSAGE_TYPES.text, info.anime.slice(0, 9).map((anAnime) => `- ${anAnime.title} [Score: ${anAnime.score}].`).join('\n'));
            _sendMessage(context, MESSAGE_TYPES.text, `It's not like I made this list for you, b-baka!`);
        })
        .catch((error) => {console.log(error)});
});

/**
 * Best command in the world.
 * 
 * First version of HTML reply, need to keep experimenting
 * to do cool things in the future
 */
bot.command('lefo', (context) => {
    _sendMessage(context, MESSAGE_TYPES.html, `<b>LEFO</b>`)
})

/**
 * First version of image sender
 * Tried to make always-new image from api but it doesnt work. Also
 * I dont have any usage ideas for images so 
 */
let listenImages = true; let imageCount = 0;
bot.command('image', (context) => {
    if (listenImages) {
        _sendMessage(context, MESSAGE_TYPES.photo, `https://picsum.photos/20${imageCount}/20${imageCount}/`);
        imageCount += 1;            
        listenImages = false;
        setTimeout(() => {listenImages = true}, 10000);
    }
});

/**
 * First version of sticker sender
 * For now it sends random stickers when command is prompted
 * 
 * Todo list:
 *  - random int must not match previous, so that sticker does not repeat
 *  - use stickers to react to some things (somewhat integration with the reaction system)
 */
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
    const args = context.message.text.split(' ');
    const secondArg = args.length > 1 && args[1];
    if (args.length > 1) {
        if (secondArg === 'list') {
            _sendMessage(context, MESSAGE_TYPES.text, `List of stickers:\n${stickers.map((sticker) => `- ${sticker.name}.`).join('\n')}`);
        } else {
            const foundSticker = stickers.find((sticker) => sticker.name === secondArg);
            if (!foundSticker) _sendMessage(context, MESSAGE_TYPES.text, `Reaction not found, enter '/sticker list' for all sticker reactions.`);
            else _sendMessage(context, MESSAGE_TYPES.sticker, foundSticker.id);
        }
    } else {
        _sendMessage(context, MESSAGE_TYPES.sticker, stickers[Math.floor(Math.random() * (stickers.length - 1) + 0)].id);
    }
});

/**
 * Just 6 numbers okay?
 * Todo list:
 *  - integrate with interval to give numbers of the day
 */
bot.command('nhentai', (context) => {
    let magicNumbers = '';
    [0, 1, 2, 3, 4, 5].forEach(() => magicNumbers += Math.floor(Math.random() * 9));
    // console.log(magicNumbers.toString());
    _sendMessage(context, MESSAGE_TYPES.text, `https://nhentai.net/g/${magicNumbers}`);
});

/**
 * First interval message sender, for now it sends to 
 * the weeb's group that message at 5pm lol
 */
// let timer = null;
// bot.on('text', (context) => {
    // timer = setInterval(() => {
    //     if(new Date().getHours() === 18) {
    //         bot.telegram.sendMessage('-449065093', "Daily reminder of existence.");    
    //     }
    // }, 1000)    
// });

/**
 * Cool reaction system for automatically reply when trigger word
 * is read
 * 
 * {triggerText, type, content}
 */
// const reactionTypes = {
//     text: 'text',
//     randomText: 'random_text',
//     sticker: 'sticker',
//     image: 'image',
// };
// const reactions = {
//     'misakaTest': {type: reactionTypes.randomText, content: `I'm Misaka`},
// };
// bot.on('text', (context) => {
//     const reaction = reactions[context.message.text.toString()];
//     // context.reply(context.chat.id);
//     // if (context.chat.id.toString() === '-449065093') context.reply('Grupo de weebs de mierda');
//     // context.reply(`Message: ${context.message.text}. Match: ${!reaction ? 'no matches' : `[type: ${reaction.type}, content: ${reaction.content}]`}.`)
//     if (!reaction) return;
//     console.log(reaction.type);
//     switch (reaction.type) {
//         case reactionTypes.text:
//             return context.reply(reaction.content)    
//             break;
//         case reactionTypes.randomText:
//             // context.reply(reactions[context.message.text].content)    
//             break;
//         case reactionTypes.sticker:
//             // context.replyWithSticker(reactions[context.message.text].content)    
//             break;
//         case reactionTypes.image:
//             // context.replyWithImage(reactions[context.message.text].content)    
//             break;
//         default: break;
//     }
// });

let todos = [];
const createTodo = (text) => todos.push({text, checked: false});
const deleteTodo = (number) => {todos = todos.filter((todo, i) => i !== number)};
const checkTodo = (number) => {todos[number] = {...todos[number], checked: true}};
const printTodos = (context) => _sendMessage(
    context,
    MESSAGE_TYPES.text,
    `Todos:${todos.length === 0 ? ' no todos.' : (todos.map((todo, i) => `\n${i}. [${todo.checked ? 'x' : ' '}] ${todo.text}.`))}`
);
bot.command('todo', (context) => {
    const args = context.message.text.split(' ');
    if (args.length === 1) {
        printTodos(context);
    } else {
        const secondArg = args[1];
        if (secondArg === 'add') {
            if (!args[2]) {
                _sendMessage(context, MESSAGE_TYPES.text, `Cannot add empty todo.`);
            } else {
                createTodo(args.slice(2).join(' '));
                printTodos(context);
            }
        } else if (secondArg === 'remove' || secondArg === 'check') {
            if (!args[2] || (!!args[2] && parseInt(args[2]) > todos.length - 1)) {
                _sendMessage(context, MESSAGE_TYPES.text, `No invalid number provided.`);
            } else {
                if (secondArg === 'remove') {
                    deleteTodo(parseInt(args[2]));
                } else if (secondArg === 'check') {
                    checkTodo(parseInt(args[2]));
                } else {
                    console.log('');
                }
                printTodos(context);
            }
        } else {
            _sendMessage(context, MESSAGE_TYPES.text, `Invalid command`);
        }
    }
});
/**
 * Debug
 */
bot.command('id', (context) => {
    _sendMessage(context, MESSAGE_TYPES.text, context.chat.id, {reply: true});
});

/**
 * Auxiliaries
 */
const MESSAGE_TYPES = {text: 'text', sticker: 'sticker', html: 'html', photo: 'photo'};

const _sendMessage = (context, type, message, options=null) => {
    console.log(WHITELIST_IDS)
    if (!WHITELIST_IDS.find(({name, id}) => id === context.chat.id.toString())) return; // check if message comes from a whitelisted group
    const now = new Date();
    const isOlder = now.getTime() > (context.message.date*1000 + 10000);
    if (isOlder) {
        // context.reply('This message is older, ignored', Extra.inReplyTo(context.message.message_id));
    } else {
        switch (type) {
            case MESSAGE_TYPES.text: 
                if (options ? options.reply : false) context.reply(message, Extra.inReplyTo(context.message.message_id)); 
                else context.reply(message);
                break;
            case MESSAGE_TYPES.sticker: context.replyWithSticker(message); break;
            case MESSAGE_TYPES.html: context.replyWithHTML(message); break;
            case MESSAGE_TYPES.photo: context.replyWithPhoto(message); break;
        }
    }
}

/* begin bot */ bot.launch();

/* f bot */
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
