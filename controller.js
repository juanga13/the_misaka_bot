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
        {id: 'table', title: 'Table'},
        {id: 'name', title: 'Name'},
        {id: 'date', title: 'Date'},
        {id: 'lastEpisode', title: 'Last Episode'},
        {id: 'malId', title: 'MAL id'},
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
        this.reader = require('csv-parser');
        this.fs = require('fs');
        this.writer = require('csv-writer');
    }

    read() {

    }

    write() {

    }
};


/* demo csv */
const data = [
    {
        table: TABLE_TYPES.BIRTHDAY,
        name: 'Juanga',
        date: '15/06/1998',
        lastEpisode: '',
        malId: '',
    }, {
        table: TABLE_TYPES.BIRTHDAY,
        name: 'Ivo',
        date: '19/04/1998',
        lastEpisode: '',
        malId: '',
    }, {
        table: TABLE_TYPES.ANIME_AIRING,
        name: '(csv_test) Shingeki no kyojin The Final Season',
        date: '',
        lastEpisode: '3',
        malId: '123456',
    }, {
        table: TABLE_TYPES.ANIME_AIRING,
        name: '(csv_test) One Piece',
        date: '',
        lastEpisode: '999999',
        malId: '654321',
    },
];

class DemoController {
    constructor() {
        this.csvWriter = createCsvWriter({
            path: 'data.csv',
            header: [
                {id: 'table', title: 'table'},
                {id: 'name', title: 'name'},
                {id: 'date', title: 'date'},
                {id: 'lastEpisode', title: 'lastEpisode'},
                {id: 'malId', title: 'malId'},
            ]
        });
    }

    getWrittenDemo() {
        return this.writtenDemo;
    }

    write() {
        this.writtenDemo = false;
        this.csvWriter
            .writeRecords(data)
            .then(() => {
                this.writtenDemo = true;
                console.log('demo yey');
            });
    }

    read() {
        console.log('=========================================');
        let result = {
            birthday: [],
            animeAiringUpdate: [],
        };
        fs.createReadStream('data.csv')
            .pipe(csv())
            .on('data', (row) => {
                const {table, name, date, lastEpisode, malId} = row;
                switch (table) {
                    case TABLE_TYPES.BIRTHDAY: result = ({...result, birthday: result.birthday.concat([{name, date}])}); break;
                    case TABLE_TYPES.ANIME_AIRING: result = {...result, animeAiringUpdate: result.animeAiringUpdate.concat([{name, lastEpisode, malId}])}; break;
                    default: break;
                }
            })
            .on('end', () => {
                console.log('=========================================');
            });
        console.log(result);
    }
}

const demo = new DemoController();
demo.write();
demo.read();