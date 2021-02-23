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
const TABLE_TYPES = {BIRTHDAY: 'birthday', ANIME_AIRING: 'animeAiringUpdate'};

class DataController {
    constructor() {
        this.isReading, this.isWriting = false;
        this.csvWriter = createCsvWriter({
            path: 'data.csv',
            header: [
                {id: 'table', title: 'table'},
                {id: 'name', title: 'name'},
                {id: 'date', title: 'date'},
                {id: 'lastEpisode', title: 'lastEpisode'},
                {id: 'malId', title: 'malId'},
                {id: 'text', title: 'Todo content'},
                {id: 'checked', title: 'Todo checked'},
            ]
        });
    }

    getState() {
        return (this.isReading || this.isWriting);
    }

    write(newData) {
        console.log('[Controller] Started writing data'); this.isWriting = true;
        const newCsv = [
            ...Object.values(newData.birthday).map(({name, date}) => ({
                table: 'birthday', name, date,
                lastEpisode: '', malId: '', text: '', checked: '',
            })),
            ...Object.values(newData.animeAiringUpdate).map(({name, lastEpisode, malId}) => ({
                table: 'animeAiringUpdate', name, lastEpisode, malId,
                date: '', text: '', checked: '',
            })),
            ...Object.values(newData.todos).map(({text, checked}) => ({
                table: 'todos', text, checked,
                name: '', lastEpisode: '', malId: '', date: '',
            })),
        ];
        this.csvWriter
            .writeRecords(newCsv)
            .then(() => {
                console.log('[Controller] Ended writing data'); this.isWriting = false;
            });
    }

    read() {
        console.log('[Controller] Started reading data.'); this.isReading = true;
        let result = {
            birthday: [],
            animeAiringUpdate: [],
            todos: [],
        };
        return new Promise((resolve, reject) => {
            fs.createReadStream('data.csv')
                .pipe(csv())
                .on('data', (row) => {
                    const {table, name, date, lastEpisode, malId, text, checked} = row;
                    switch (table) {
                        case TABLE_TYPES.BIRTHDAY: 
                            result = ({...result, birthday: [...result.birthday, {name, date}]});
                            console.log('birthday', {name, date}, result);
                            break;
                        case TABLE_TYPES.ANIME_AIRING:
                            result = {...result, animeAiringUpdate: [...result.animeAiringUpdate, {name, lastEpisode, malId}]};
                            console.log('animeAiringUpdate', {name, date}, result);
                            break;
                        case TABLE_TYPES.TODOS:

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
}


module.exports = new DataController();