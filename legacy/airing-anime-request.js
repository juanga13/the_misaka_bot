const fetch = require('node-fetch');

global.fetch = fetch

const currentlyAiringAnime = require('currently-airing-anime');

currentlyAiringAnime().then(({shows, next}) => {
    console.log(shows);
})

export const allAiringAnime = () => {

};