# Phrase API

### Dependencies

  - [node](https://github.com/creationix/nvm)
  - [rethinkdb](https://www.rethinkdb.com/docs/install/)

### Start rethinkdb

    rethinkdb

### Install / Run

    npm install
    npm start


### Deployment

- shell into digital ocean server


    ssh root@159.203.75.254

- pull latest `TODO: write script for this`


    cd phrase
    cd phrase-api && git pull origin develop
    cd ../phrase-client && git pull origin develop

- view running servers


    tmux attach

- switch active pane


    ctrl-b, ;

- detach from tmux


    ctrl-b, d

- view screens


    screen -ls


- attach to screen (screen already running in tmux session)


    screen -r 5471.api

- exit server


    exit
