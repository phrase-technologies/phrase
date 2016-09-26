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

# Tests

    npm test

or

    npm run test-watch

Mocha will execute the tests in all files below the `tests` folder using `tests/root.test.js`
as an entry point.

If you add a new route or socket event handler, please write a test for it.

# Deployment
See [full deployment docs here](DEVOPS.md)

### Database Migrations
All migrations need babel transpilation to work, in those cases use this command:

    npm run migrate scripts/migrations/2016....