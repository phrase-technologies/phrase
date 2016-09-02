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
See [full deployment docs here](DEVOPS.md)

### Database Migrations
Certain migrations need babel transpilation to work, in those cases use this command:

    npm run migrate -- scripts/migrations/2016....
    
Otherwise, you can just do:

    node scripts/migrations/2016...

