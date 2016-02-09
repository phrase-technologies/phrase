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

import { Provider } from 'react-redux'
import STORE from './reducers/createStore.js'
import Layout from './components/Layout.js'

ReactDOM.render(
  <Provider store={STORE}>
    <Layout />
  </Provider>,
  document.getElementById('root')
)