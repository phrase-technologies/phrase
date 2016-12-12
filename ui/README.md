Phrase Studio - React Client
=====================

Based off of the `react-hot-boilerplate` repo from Dan Abramov, version [1.0.0](https://github.com/gaearon/react-hot-boilerplate/tree/3883f8ac7181aa42eed2485e7c72ea7599d7792e) from September 13th 2015.

### Setup
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

### Running / Building

 - local dev server

```
npm start
```

 - prod dev server

```
npm run start-prod
```

 - build prod (port 80)

```
npm run build
```

 - build "prod-mode" locally (port 3333)

```
npm run build-local
```

### Tests

 - run once

```
npm test
```

 - watch

```
npm run test-watch
```

### Contributing

Check code quality first: (TODO: Automate this via CI hook)
```
npm run lint
```

Submit pull request when ready
