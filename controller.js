/**
 * First version of database for misakabot
 * 
 * Why use csv wtf? Because little data.
 */

const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'data.csv',
    header: [
        /* ID*/ {id: 'table', title: 'Table'},
        /* BIRTHDAY | ANIME*/ {id: 'name', title: 'Name'},
        /* BIRTHDAY*/ {id: 'date', title: 'Date'},
        /* ANIME*/ {id: 'lastEpisode', title: 'Last Episode'},
        /* ANIME*/ {id: 'malId', title: 'MAL id'},
        /* TODOS */ {id: 'text', title: 'Todo content'},
        /* TODOS */ {id: 'checked', title: 'Todo checked'},
    ]
});
/*
Parsing table will output these objects

============= [1] ================
table='birthday' + name + date 
birthday: [
    {name: 'Juancito', date: '10/01/1990'} --> date format dd/nn/yyyy
]
============= [2] ================
table='animeAiringUpdate' + name + lastEpisode + malId
note1: malId is used for jikan api
animeAiringUpdate: [
    {name: 'Shingeki no Kyojin The Final Season', lastEpisode: 7, malId: 40028}
]
*/
const TABLE_TYPES = {BIRTHDAY: 'birthday', ANIME_AIRING: 'animeAiringUpdate', TODOS: 'todos'};

class DataController {
    constructor() {
        this.isReading, this.isWriting = false;
        this.csvWriter = createCsvWriter({
            path: 'data.csv',
            header: [
                {id: 'table', title: 'table'},
                {id: 'chatId', title: 'chatId'},
                {id: 'name', title: 'name'},
                {id: 'date', title: 'date'},
                {id: 'lastEpisode', title: 'lastEpisode'},
                {id: 'malId', title: 'malId'},
                {id: 'text', title: 'text'},
                {id: 'checked', title: 'checked'},
            ]
        });
    }

    getState() {
        return (this.isReading || this.isWriting);
    }

    write(newData) {
        console.log('[Controller] Started writing data'); this.isWriting = true;
        let newCsv = [];
        Object.keys(newData).forEach((chatId) => {
            Object.values(newData[chatId].birthday).forEach(({name, date}) => {
                newCsv.push({
                    table: 'birthday', chatId, name, date,
                    lastEpisode: '', malId: '', text: '', checked: '',
                })
            });
            Object.values(newData[chatId].animeAiringUpdate).forEach(({name, lastEpisode, malId}) => {
                newCsv.push({
                    table: 'animeAiringUpdate', chatId, name, lastEpisode, malId,
                    date: '', text: '', checked: '',
                })
            });
            Object.values(newData[chatId].todos).forEach(({text, checked}) => {
                newCsv.push({
                    table: 'todos', chatId, text, checked,
                    name: '', lastEpisode: '', malId: '', date: '',
                })
            });
        });
        this.csvWriter
            .writeRecords(newCsv)
            .then(() => {
                console.log('[Controller] Ended writing data'); this.isWriting = false;
            });
    }

    read() {
        console.log('[Controller] Started reading data.'); this.isReading = true;
        let result = {};
        return new Promise((resolve, reject) => {
            fs.createReadStream('data.csv')
                .pipe(csv())
                .on('data', (row) => {
                    const {table, chatId, name, date, lastEpisode, malId, text, checked} = row;
                    // console.log('row', row);
                    result = this.checkAndCreate(chatId, result);
                    switch (table) {
                        case TABLE_TYPES.BIRTHDAY: 
                            result = {
                                ...result,
                                [chatId]: {
                                    ...results[chatId],
                                    birthday: [
                                        ...(result[chatId] && result[chatId].birthday),
                                        {name, date}
                                    ]
                                }
                            };
                            break;
                        case TABLE_TYPES.ANIME_AIRING:
                            result = {
                                ...result,
                                [chatId]: {
                                    ...results[chatId],
                                    animeAiringUpdate: [
                                        ...(result[chatId] && result[chatId].animeAiringUpdate),
                                        {name, lastEpisode, malId}
                                    ]
                                }
                            };
                            break;
                        case TABLE_TYPES.TODOS:
                            result = {
                                ...result,
                                [chatId]: {
                                    ...result[chatId],
                                    todos: [
                                        ...(result[chatId] && result[chatId].todos),
                                        {text, checked: checked === 'true'}
                                    ]
                                }
                            };
                            break;
    
                        default: break;
                    }
                })
                .on('end', () => {
                    console.log('[Controller] Ended reading data');  this.isReading = false;
                    console.log(result);
                    resolve(result)
                });
        });
        return result;
    }

    checkAndCreate(chatId, dataToBe) {
        if (!dataToBe[chatId]) return {...dataToBe, [chatId]: {birthday: [], animeAiringUpdate: [], todos: []}};
        else return dataToBe; 
    }
}


module.exports = new DataController();