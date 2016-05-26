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
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router'
import { createHistory, useBeforeUnload } from 'history'
import { phraseCreateTrack } from 'reducers/reducePhrase.js'

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
  // Setup initial state - 2 tracks by default
  let state = STORE.getState()
  if (!state.phrase || state.phrase.past.length === 0 && state.phrase.present.tracks.length === 0) {
    STORE.dispatch(phraseCreateTrack())
    STORE.dispatch(phraseCreateTrack())
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
import App from 'components/App.js'
import Workstation from 'components/Workstation.js'
import Library from 'components/Library.js'
import UserProfile from 'components/UserProfile.js'
import About from 'components/About.js'
import Error404 from 'components/Error404.js'

// window.onload - Require all assets to be loaded before rendering.
// This is only necessary because we are using Google Font API in font.scss.
// Possibly stick to websafe fonts, or roll the font into WebPack? TODO
window.onload = () => {
  ReactDOM.render(
    <StoreProvider store={STORE}>
      <EngineProvider engine={ENGINE}>

        <Router history={HISTORY}>
          <Route path="/" component={App}>
            <IndexRoute phraseMode={false} component={Library} />
            <Route path="/search" component={Library} />
            <Route path="/search/:searchTerm" component={Library} />
            <Route path="/user/:userId" component={UserProfile} />
            <Route path="/phrase/new" component={Workstation} />
            <Route path="/phrase/:username/:phraseId" component={Workstation} />
            <Route path="/phrase/:username/:phraseId/:phrasename" component={Workstation} />
            <Route path="/about" component={About} />
            <Route path="/developers" component={About} />
            <Route path="*" component={Error404} />
          </Route>
        </Router>

      </EngineProvider>
    </StoreProvider>,
    document.getElementById('root')
  )
}
