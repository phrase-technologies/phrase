// ============================================================================
// GLOBAL SCRIPTS
// ============================================================================
require("css-element-queries/src/ResizeSensor.js");
require("css-element-queries/src/ElementQueries.js");

// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================
import './index.scss';
import React from 'react'
import ReactDOM from 'react-dom'

import { createStore } from 'redux';
import musicApp from './reducers/reducers.js';

import { Provider } from 'react-redux';
import Layout from './components/Layout.js';

var store = createStore(musicApp);

ReactDOM.render(
  // The child must be wrapped in a function
  // to work around an issue in React 0.13.
  <Provider store={store}>
    <Layout />
  </Provider>,
  document.getElementById('root')
)