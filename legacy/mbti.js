const botModule = require('./bot');


const _print = (context, sendMessage, mbtis) => {
    sendMessage(context, botModule.MESSAGE_TYPES.text, `All this group's MBTIs:\n${Object.values(mbtis).map((mbti) => `\n- ${mbti.userName}:\t${mbti.mbti}.`)}`);
};

const _help = (context, sendMessage) => {
    sendMessage(context, botModule.MESSAGE_TYPES.text, `List of commands:\n- /mbti help: This message.\n- /mbti me: Show your MBTI if already added.\n- /mbti me XXXX: Change or add (if not existing) my MBTI.`);
};

const _check_and_format_mbti_string = (mbti) => {
    const firstOk = !!['e', 'i', 'x'].find((letter) => letter === mbti[0].toLowerCase());
    const secondOk = !!['n', 's', 'x'].find((letter) => letter === mbti[1].toLowerCase());
    const thirdOk = !!['f', 't', 'x'].find((letter) => letter === mbti[2].toLowerCase());
    const fourthOk = !!['j', 'p', 'x'].find((letter) => letter === mbti[3].toLowerCase());
    if (firstOk && secondOk && thirdOk && fourthOk) {
        return `${mbti[0]==='x'?mbti[0].toLowerCase():mbti[0].toUpperCase()}${mbti[1]==='x'?mbti[1].toLowerCase():mbti[1].toUpperCase()}${mbti[2]==='x'?mbti[2].toLowerCase():mbti[2].toUpperCase()}${mbti[3]==='x'?mbti[3].toLowerCase():mbti[3].toUpperCase()}`;
    } else return null;
};

/*
/mbti
/mbti help
/mbti me
/mbti me XXXX
/mbti Asd
/mbti Asd XXXX
*/
module.exports = (context, sendMessage, mbtis, addOrChangeToDb) => {
    const args = context.message.text.split(' ');
    if (args.length === 1) _print(context, sendMessage, mbtis);
    else {
        const secondArg = args[1]; const thirdArg = args[2];
        switch (secondArg) {
            case 'help': _help(context, sendMessage); break;
            case 'me':
                if (!thirdArg) {
                    const usersMbti = mbtis.find((mbti) => mbti.userId === context.message.from.id);
                    if (!!usersMbti) sendMessage(context, botModule.MESSAGE_TYPES.text, `${usersMbti.userName}, your MBTI is: ${usersMbti.mbti}`);
                    else sendMessage(context, botModule.MESSAGE_TYPES.text, `You don't have MBTI set yet!`, {reply: true});
                } else {
                    if (thirdArg.length !== 4) sendMessage(context, botModule.MESSAGE_TYPES.text, 'Thats not an MBTI you inserted there wtf', {reply: true});
                    else {
                        const newMbti = _check_and_format_mbti_string(thirdArg);
                        if (!!newMbti) {
                            addOrChangeToDb(context.chat.id, context.message.from.id, context.message.from.first_name, newMbti);
                            sendMessage(context, botModule.MESSAGE_TYPES.text, `${context.message.from.first_name}'s MBTI is now ${newMbti}`, {reply: true});
                        }
                        else sendMessage(context, botModule.MESSAGE_TYPES.text, 'Thats not an MBTI you inserted there wtf', {reply: true});
                    }
                }
                break;
            default:  //only @someone
                // if (context.message.entities.length === 2) {
                //     const newMbti = _check_and_format_mbti_string(thirdArg);
                //     if (!!newMbti) {
                //         console.log('entities', context.message.entities);
                //         addOrChangeToDb(context.chat.id, context.message.entities[1].user.id, context.message.entities[1].user.first_name, newMbti);
                //         sendMessage(context, botModule.MESSAGE_TYPES.text, `${context.message.entities[1].user.first_name}'s MBTI is now ${newMbti}`, {reply: true});
                //     } else sendMessage(context, botModule.MESSAGE_TYPES.text, 'Thats not an MBTI you inserted there wtf', {reply: true});
                // } else sendMessage(context, botModule.MESSAGE_TYPES.text, `Second argument can only be 'me' or mention someone in the group.`, {reply: true});
                break;
        }
    }
}
