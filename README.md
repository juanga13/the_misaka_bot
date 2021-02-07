# The Misaka Bot
## Current features
- useful:
    - ```/help```: classic.
    - ```/season```: requests from jikan api current seasonals and prints the 10 most popular as a list. 
        - *future* Will notify you when new season comes with the upcoming animes.
    - ```/lefo```: lefo reply.
        - *future* add HTML and other cool stuff available to do.
    - ```/image```: random image.
        - *future* memes?
    - ```/sticker [reaction]```: from a custom made misaka sticker pack. If not reaction provided (just ```/sticker```) it will send a random one of the pack, if not it will send the selected one.
        - *future* add a reaction system to make it more 'humane'.
    - ```/todo```: print list, add, check or remove.
    - ```/birthday```: print list, add, remove. WIP
        - *future* notify when is someones birthday, maybe also change the groups name, etc.

## Future features
- ```/anime```
    - suscribe/unsuscribe to an anime
    - when suscribed to an airing anime, notify when new chapter is up
    - when suscribed to a finished anime, send news
    - when suscribed to an unstarted anime, send news until is airing, then notify new chapters.
- ```/manga``` same as /anime but probably it wont have very nice apis, need to investigate that.


## personal notes

### .env variables
TOKEN: token needed to run any telegram bot lol.
WEEBS_GROUP_ID: private id (not used currently).
MAJOR_VERSION: differentiate major version, as its important i decided to place it here just because.

### install telegraf v3

- go to https://github.com/telegraf/telegraf
- clone repo
- change to v3 branch
- go to this repo and do npm install ./telegraf/
- now ```const Extra = require('telegraf/extra');``` works