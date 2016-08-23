# Phrase API

### Dependencies

  - [node](https://github.com/creationix/nvm)
  - [rethinkdb](https://www.rethinkdb.com/docs/install/)

### Start rethinkdb

    rethinkdb

### Install / Run

    npm install
    npm start

You may need to update the `src/config.js` file with the phrase-client URL in your environment.

# Run Tests

    npm test

It takes a little while to setup the database every time you run the tests, so consider
running them at the end of your coding session, and absolutely before merging anything to develop.

## Add Tests!!!

We just added server side tests.. there are many more routes to test so please write
then when you can. If you add a new route, add a test!

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
