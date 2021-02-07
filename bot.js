/* deps */
const {Telegraf} = require('telegraf');
const Extra = require('telegraf/extra');
const Jikan = require('jikan-node');
const dotenv = require('dotenv');
const gitCommitCount = require('git-commit-count');

/* instances */
dotenv.config();
const token = process.env.TOKEN;
const mal = new Jikan();
const bot = new Telegraf(token);
const {WHITELIST_IDS} = require('./whitelist');
const controller = require('./controller');
const { isValid } = require('date-fns');
const version = `${process.env.MAJOR_VERSION}.${gitCommitCount()}`;  // great, major version + commit B) will need to change later if version goes to 2 and commits still N yep



const MESSAGE_TYPES = {text: 'text', sticker: 'sticker', html: 'html', photo: 'photo'};


let data = {birthday: [], animeAiringUpdate: []};
controller.read().then(res => data = res);
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
        {command: '/help', description: `this fukin message.`},
        {command: '/season', description: `this seasonal's animes.`},
        {command: '/lefo', description: `LEFO.`},
        {command: '/image', description: `random image.`},
        {command: '/sticker [reaction]', description: `random sticker unless reaction is given, See '/sticker list' for every sticker.`},
        {command: '/nhentai', description: `yyyyep.`},
        {command: '/todo', description: `Todos list, show all actions with '/todo help'.`},
        {command: '/birthday', description: `List of birthdays, show more actions with '/birthday help'.`},
    ];
    _sendMessage(context, MESSAGE_TYPES.text, `What are you, stupid? Here's what I can do:\n${help.map((item) => `- ${item.command}: ${item.description}`).join('\n')}`)
})

bot.command('asd', (context) => _sendMessage(context, MESSAGE_TYPES.text, 'hi', {reply: true}))
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
        } else if (secondArg === 'help') {
            _sendMessage(context, MESSAGE_TYPES.text, `/todo options (note: [text] is whatever goes next):\n\n- '/todo' show list of todos.\n- '/todo add [text]': adds a new unchecked todo.\n- '/todo check [number]' checks a todo, the number must match with one of the list provided. Note that uncheck is not possible.\n- '/todo remove [number]': removes a todo, the number must match with one of the list provided.`)
        } else {
            _sendMessage(context, MESSAGE_TYPES.text, `Invalid command`);
        }
    }
});

/**
 * Birthday system
 */

const printBirthdays = (context) => _sendMessage(context, MESSAGE_TYPES.text, `All birthdays:\n${data.birthday.map((birthday, i) => `- ${i}. Name: ${birthday.name}, date: ${birthday.date}`).join('\n')}`)
bot.command('birthday', (context) => {
    console.log('[Bot] Birthday command entered')
    if (controller.isReading || controller.isWriting) _sendMessage(context, MESSAGE_TYPES.text, 'chotto matte');
    else {
        const args = context.message.text.split(' ');
        if (args.length === 1) printBirthdays(context);
        else {
            const secondArg = args[1];
            switch (secondArg) {
                case 'help':
                    _sendMessage(context, MESSAGE_TYPES.text, `'/birthday' options:\n\n- '/birthday add [text] [date]': saves a new birthday, [text] will be everything until a number is found, and [date] needs to follow "DD/MM" pattern. Example: "/birthday add Jose Perez 01/01/1970".\n- '/birthday remove [number]': removes a birthday matching the number with the one provided in the list.`);
                    break;
                case 'add':
                    const rest = args.slice(2).join(' ');
                    let startOfDate = -1;
                    for (var i = 0; i < rest.length; i++) {
                        if (!isNaN(parseInt(rest[i])) && startOfDate === -1) startOfDate = i;
                    }
                    const name = rest.substring(0, startOfDate).trim();
                    const date = rest.substring(startOfDate, rest.length);
                    let isDateValid = true;
                    if (date.length !== 5) isDateValid = false;
                    else {
                        for (var i = 0; i < date.length; i++) {
                            if (i === 2) {
                                if (date[i] !== '/') isDateValid = false;
                            } else if (isNaN(parseInt(date[i]))) isDateValid = false;
                        }
                    }
                    if (isDateValid) {
                        const day = date.substring(0, 2) 
                        const month = date.substring(3, 5);
                        const monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
                        if (month < 1 || day < 1 || 
                            month > monthLength.length ||
                            day > monthLength[month - 1]) _sendMessage(context, MESSAGE_TYPES.text, `The date does not exist.`);
                        else {
                            _db_add_birthday(name, date);
                            printBirthdays(context); 
                        }
                    } else _sendMessage(context, MESSAGE_TYPES.text, `The date does not match with pattern.`);
                    break;
                case 'remove':
                    const index = parseInt(args[2]);
                    if (isNaN(index) || data.birthday.length < index + 1) _sendMessage(context, MESSAGE_TYPES.text, `Invalid number.`);
                    else {
                        _db_remove_birthday(index);
                        printBirthdays(context);
                    }
                    break;
                default: break;
            }
        }
    }
})

/**
 * Cool reaction system for automatically reply when trigger word
 * is read
 * 
 * {triggerText, type, content}
 */
const reactionTypes = {
    text: 'text',
    randomText: 'random_text',
    sticker: 'sticker',
    image: 'image',
};
const reactions = [
    {keyword: /(a{9})+/, isRegex: true, type: MESSAGE_TYPES.text, message: 'AAAAAAAAAA', reply: false},
    {keyword: /(8|ocho)$/, isRegex: true, type: MESSAGE_TYPES.text, message: 'El culo te abrocho', options: {reply: true}},
    {keyword: /(9|nueve)$/, isRegex: true, type: MESSAGE_TYPES.text, message: 'El culo te llueve', options: {reply: true}},
];
bot.on('text', (context) => {
    const msg = context.message.text.toString().toLowerCase();
    const reaction = reactions.find((reaction) => {
        if (reaction.isRegex && reaction.keyword.test(msg)) return true
        else return msg === reaction.keyword;
    });
    if (!!reaction) _sendMessage(context, reaction.type, reaction.message, reaction.options);
});
/**
 * Auxiliaries, includes:
 * <> _sendMessage -> every sending intentions to any chat should call this.
 * <> _db_get -> gets a table of the database as list of objects
 */

const _sendMessage = (context, type, message, options=null) => {
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
            case MESSAGE_TYPES.sticker:
                if (options ? options.reply : false) context.replyWithSticker(message, Extra.inReplyTo(context.message.message_id)); 
                else context.replyWithSticker(message);
                break;
            case MESSAGE_TYPES.html:
                if (options ? options.reply : false) context.replyWithHTML(message, Extra.inReplyTo(context.message.message_id)); 
                else context.replyWithHTML(message);
                break;
            case MESSAGE_TYPES.photo:
                if (options ? options.reply : false) context.replyWithPhoto(message, Extra.inReplyTo(context.message.message_id)); 
                else context.replyWithPhoto(message);
                break;

            default: break;
        }
    }
}

/** ============================================================
 * Miscellaneus, mostly temporal
 ============================================================ */
 bot.command('id', (context) => {
    context.reply(context.chat.id);
});
let listenImages = true; let imageCount = 0;
bot.command('image', (context) => {
    if (listenImages) {
        _sendMessage(context, MESSAGE_TYPES.photo, `https://picsum.photos/20${imageCount}/20${imageCount}/`);
        imageCount += 1;            
        listenImages = false;
        setTimeout(() => {listenImages = true}, 10000);
    }
});

// 01/05 -> day=0; month=4
const _parseBirthday = (birthday) => {
    const day = parseInt(birthday.substring(0, 2));
    const month = parseInt(birthday.substring(3, 5)) - 1;
    return {day, month};
};

let ROUTINARY_CHECK_CONFIG = {
    enable: true,
    // timeout: 3600000,  // 1 hour
    timeout: 100000,
    birthday: {hourToNofiy: 17},
    testId: WHITELIST_IDS[0].id,
};
const routinaryCheck = () => setInterval(async () => {
    console.log('========== [Bot] This is routinary check. ==========');

    /* Check for birthdays */
    const now = new Date();
    const doNotifyNow = now.getHours() === ROUTINARY_CHECK_CONFIG.birthday.hourToNofiy; // only check our because timeout is 1 hour.
    console.log(`--> [Bot/birthdays] Begun check`)
    data.birthday.forEach((birthday) => {
        const {day, month} = _parseBirthday(birthday.date);
        const isToday = now.getMonth() === month && now.getDate() === day;
        console.log(`\t-> [Bot/birthdays] Is ${birthday.name}'s birthday today (${birthday.date})? -> ${isToday ? 'yes' : 'no'}`)
        if (isToday && doNotifyNow) {
            bot.telegram.sendMessage(ROUTINARY_CHECK_CONFIG.testId, `Happy birthday ${birthday.name}!!`);
        }
    });
    console.log(`--> [Bot/birthdays] Finished check`);
    console.log('========== [Bot] Ended routinary check. ==========');
}, ROUTINARY_CHECK_CONFIG.timeout);


/**
 * Returns all data from a single "table"
 * @param { string } type -> birthday or animeAiringUpdate for now 
 */
const _db_add_birthday = (name, date) => {
    const newData = {...data, birthday: [...data.birthday, {name, date}]}
    data = newData;
};
const _db_remove_birthday = (index) => {
    const newData = {...data, birthday: data.birthday.filter((birthday, i) => i !== index)}
    data = newData;
};
const _db_add_animeAiringUpdate = (name, lastEpisode, malId) => {
    const newData = {...data, animeAiringUpdate: [...data.animeAiringUpdate, {name, lastEpisode, malId}]}
    data = newData;
};



/** ============================================================
 * Init
 ============================================================ */
console.log(`Launching the_misaka_bot - version ${version}`)
routinaryCheck();
bot.launch();
 

/** ============================================================
 * On terminate calls
 ============================================================ */
const saveProgress = () => {
    if (controller.isReading || controller.isWriting) setTimeout(saveProgress, 300);
    else controller.write(data);
}
process.once('SIGINT', () => {
    console.log('SIGINT under action');
    saveProgress();
    bot.stop('SIGINT');
})
process.once('SIGTERM', () => {
    console.log('SIGTERM under action');
    saveProgress();
    bot.stop('SIGTERM');
})
