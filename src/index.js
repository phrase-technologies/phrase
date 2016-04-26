import 'babel-polyfill'

// ============================================================================
// GLOBAL SCRIPTS
// ============================================================================
require(`css-element-queries/src/ResizeSensor.js`)
require(`css-element-queries/src/ElementQueries.js`)

import './index.scss'
import React from 'react'
import ReactDOM from 'react-dom'

// ============================================================================
// Create the STORE + HISTORY god objects
// ============================================================================
import { Provider as StoreProvider } from 'react-redux'
import EngineProvider from 'audio/AudioEngineProvider.js'
import { createStore, compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { Router, Route, browserHistory } from 'react-router'
import { phraseCreateTrack } from 'reducers/reducePhrase.js'

// import { syncHistoryWithStore } from 'react-router-redux'
import finalReducer from './reducers/reduce.js'
import * as storage from 'redux-storage'
import createStorageEngine from 'redux-storage-engine-localstorage'

const localStorageEngine = createStorageEngine(`phrase`)
const localStorageMiddleware = storage.createMiddleware(localStorageEngine)

const finalCreateStore = compose(
  applyMiddleware(thunk, localStorageMiddleware),
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore)

const STORE = finalCreateStore(storage.reducer(finalReducer))
// const HISTORY = syncHistoryWithStore(browserHistory, STORE)

const load = storage.createLoader(localStorageEngine)
load(STORE).then(state => {
  // Setup initial state - 2 tracks by default
  if (state.phrase && state.phrase.past && state.phrase.past.length === 0) {
    STORE.dispatch(phraseCreateTrack())
    STORE.dispatch(phraseCreateTrack())
  }
})

// ============================================================================
// Setup Audio Engine god object
// ============================================================================
import createAudioEngine from 'audio/AudioEngine.js'
const ENGINE = createAudioEngine(STORE)

// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================
import CursorProvider from 'components/CursorProvider.js'
import HotkeyProvider from 'components/HotkeyProvider.js'
import App from 'components/App.js'
import Error404 from 'components/Error404.js'

// window.onload - Require all assets to be loaded before rendering.
// This is only necessary because we are using Google Font API in font.scss.
// Possibly stick to websafe fonts, or roll the font into WebPack? TODO
window.onload = () => {
  ReactDOM.render(
    <StoreProvider store={STORE}>
      <EngineProvider engine={ENGINE}>
        <CursorProvider>
          <HotkeyProvider>

            <Router history={browserHistory}>
              <Route path="/" component={App} />
              <Route path="/edit" component={App} />
              <Route path="/*" component={Error404}/>
            </Router>

          </HotkeyProvider>
        </CursorProvider>
      </EngineProvider>
    </StoreProvider>,
    document.getElementById('root')
  )
}
