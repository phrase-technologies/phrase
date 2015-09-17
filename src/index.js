import './index.scss';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import Layout from './components/Layout.js';
import musicApp from './reducers/reducers.js';

var store = createStore(musicApp);

React.render(
  // The child must be wrapped in a function
  // to work around an issue in React 0.13.
  <Provider store={store}>
    {() => <Layout />}
  </Provider>,
  document.getElementById('root')
);