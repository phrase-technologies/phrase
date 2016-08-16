# Phrase API

### Dependencies

  - [node](https://github.com/creationix/nvm)
  - [rethinkdb](https://www.rethinkdb.com/docs/install/)

### Start rethinkdb

    rethinkdb

### Install / Run

    npm install
    npm start

Create a `server.config.js` file in the root folder with the following contents:

    export let clientURL = `localhost:3000`

Replace `localhost:3000` with the phrase-client URL in your environment.

# Deployment

#### Shell into digital ocean server

    ssh root@159.203.75.254

#### Pull latest `TODO: write script for this`

    cd phrase
    cd phrase-api && git pull origin develop
    cd ../phrase-client && git pull origin develop

### Database Migrations

    npm run migrate -- scripts/migrations/2016....

#### Running panes/servers

    tmux attach

If nothing already running, launch new panes:

    tmux
    ctrl+b, %

Launch client:

    cd ../phrase-client
    npm run start-prod

Launch API:

    cd ../phrase-api
    npm start

Launch RethinkDB (`--bind all` only if you want web console):

    cd ../../rethinkdb_data
    rethinkdb --bind all


#### Switch active pane

    ctrl+b, o

#### Detach from `tmux`

    ctrl+b, d

#### Exit active pane/server

    exit
