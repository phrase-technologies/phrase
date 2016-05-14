import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from "react-helmet"

import Header from 'components/Header'
import Workstation from 'components/Workstation'
import CursorProvider from 'components/CursorProvider.js'
import HotkeyProvider from 'components/HotkeyProvider.js'

import * as AllModals from 'components/modals'

import { libraryLoadAll } from 'reducers/reduceLibrary'
import { phraseLoadFromDb } from 'reducers/reducePhrase'

export class App extends Component {
  componentDidMount() {
    let { dispatch, params } = this.props
    dispatch(libraryLoadAll())

    // Attempt to load user's phrase from url.
    if (params.phraseId) {
      dispatch(phraseLoadFromDb(params.phraseId))
    }
  }

  render() {
    let ActiveModal = this.props.activeModal ? AllModals[this.props.activeModal] : 'div'
    let phraseOpen = this.props.routes[1].phraseOpen
    let headerTheme = phraseOpen ? 'solid' : 'clear'
    let bodyClasses = 'body' + (phraseOpen ? ' body-faded' : '')
    if (phraseOpen)
      localStorage.setItem('lastOpenPhrase', this.props.routes[1].path)

    return (
      <CursorProvider>
        <HotkeyProvider>

          <div>
            <Helmet
              link={[
                {"rel": "icon", "href": require('../img/favicon.ico'), "type": "img/ico"}
               ]}
             />
            <Header theme={headerTheme} params={this.props.params}/>
            <div className={bodyClasses}>
              { this.props.children }
            </div>
            <Workstation maximized={phraseOpen} />
            <ActiveModal show={this.props.show} />
          </div>

        </HotkeyProvider>
      </CursorProvider>
    )
  }
}

function mapStateToProps(state) {
  return {
    ...state.modal
  }
}
export default connect(mapStateToProps)(App)
