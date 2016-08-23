# Phrase API

### Dependencies

  - [node](https://github.com/creationix/nvm)
  - [rethinkdb](https://www.rethinkdb.com/docs/install/)

### Start rethinkdb

    rethinkdb

### Install / Run

    npm install
    npm start

If the client is not running at `localhost:3000`, start like this instead:

    CLIENT_URL=<ip_address> npm start

# Run Tests

    npm test

It takes a little while to setup the database every time you run the tests, so consider
running them at the end of your coding session, and absolutely before merging anything to develop.

## How Do They Work??

Mocha will execute the tests in all files below the `src` folder that end with `*.test.js`.
There's one file, `src/root.test.js` that has a global `before` hook that will run once
before all the other tests mocha finds, and similarly an `after` hook which runs once after all
the tests are done.

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
    CLIENT_URL=phrase.fm npm start

Launch RethinkDB (`--bind all` only if you want web console):

    cd ../../rethinkdb_data
    rethinkdb --bind all


#### Switch active pane

    ctrl+b, o

#### Detach from `tmux`

    ctrl+b, d

#### Exit active pane/server

    exit
