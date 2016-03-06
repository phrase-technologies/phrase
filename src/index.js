// ============================================================================
// GLOBAL SCRIPTS
// ============================================================================
require("css-element-queries/src/ResizeSensor.js");
require("css-element-queries/src/ElementQueries.js");

import './index.scss';
import React from 'react'
import ReactDOM from 'react-dom'

// ============================================================================
// Create the STORE
// ============================================================================
import { Provider as StoreProvider } from 'react-redux'
import EngineProvider from './audio/AudioEngineProvider.js'
import { createStore, compose, applyMiddleware } from 'redux'
import finalReducer from './reducers/reduce.js'
import Layout from './components/Layout.js'

const finalCreateStore = compose(
  applyMiddleware(),
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore);
const STORE = finalCreateStore(finalReducer)

// Setup initial state - 2 tracks by default
import { phraseCreateTrack } from './actions/actionsPhrase.js'
STORE.dispatch( phraseCreateTrack() )
STORE.dispatch( phraseCreateTrack() )

// ============================================================================
// Setup Audio Engine
// ============================================================================
import createAudioEngine from './audio/AudioEngine.js'
const ENGINE = createAudioEngine(STORE)

// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================
ReactDOM.render(
  <StoreProvider store={STORE}>
    <EngineProvider engine={ENGINE}>
      <Layout />
    </EngineProvider>
  </StoreProvider>,
  document.getElementById('root')
)