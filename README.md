Phrase Studio - React Client
=====================

Based off of the `react-hot-boilerplate` repo from Dan Abramov, version [1.0.0](https://github.com/gaearon/react-hot-boilerplate/tree/3883f8ac7181aa42eed2485e7c72ea7599d7792e) from September 13th 2015. 

## Setup
```
npm install
```
Create `server.config.js` in the root folder with the following contents:
```
module.exports = {
  "HOST": "localhost",
  "PORT": 3000
}
```
Choose whatever `HOST` and `PORT` you prefer.

## Running
```
npm start
open http://localhost:3000
```

## Tests

```
npm test
```

## Contributing
Check code quality first: (TODO: Automate this via CI hook)
```
npm run lint
```

Submit pull request when ready