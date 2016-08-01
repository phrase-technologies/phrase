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
import { Router, useRouterHistory } from 'react-router'
import { createHistory, useBeforeUnload } from 'history'

import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux'
import finalReducer from './reducers/reduce.js'
import { ActionCreators as UndoActions } from 'redux-undo'
import { persistStore } from 'redux-persist'

const browserHistory = useBeforeUnload(useRouterHistory(createHistory))()

import autosave from 'middleware/autosave'

const finalCreateStore = compose(
  applyMiddleware(
    thunk,
    routerMiddleware(browserHistory),
    autosave,
  ),
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore)

const STORE = finalCreateStore(finalReducer)

const persistConfig = {
  whitelist: [
    `phrase`,
    `phraseMeta`
  ]
}
persistStore(STORE, persistConfig, () => {
  let state = STORE.getState()
  if (!state.phrase || state.phrase.past.length === 0 && state.phrase.present.tracks.length === 0) {
    STORE.dispatch(UndoActions.clearHistory())
  }
})

const HISTORY = syncHistoryWithStore(browserHistory, STORE)

// ============================================================================
// Setup Audio Engine god object
// ============================================================================
import createAudioEngine from 'audio/AudioEngine.js'
const ENGINE = createAudioEngine(STORE)

// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================
import Routes from 'components/Routes.js'

// window.onload - Require all assets to be loaded before rendering.
// This is only necessary because we are using Google Font API in font.scss.
// Possibly stick to websafe fonts, or roll the font into WebPack? TODO
window.onload = () => {
  let root = document.createElement(`div`)
  document.body.appendChild(root)

  ReactDOM.render(
    <StoreProvider store={STORE}>
      <EngineProvider engine={ENGINE}>

        <Router history={HISTORY}>
          {Routes}
        </Router>

      </EngineProvider>
    </StoreProvider>,
    root
  )
}
