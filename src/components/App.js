import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from "react-helmet"

import Header from 'components/Header'
import CursorProvider from 'components/CursorProvider.js'
import HotkeyProvider from 'components/HotkeyProvider.js'

import * as AllModals from 'components/modals'

export class App extends Component {

  render() {
    let maximize = this.props.routes[1].maximize
    let ActiveModal = this.props.activeModal ? AllModals[this.props.activeModal] : 'div'
    let headerTheme = true ? 'solid' : 'clear'
    let faviconConfig = [{
      rel: "icon",
      href: require('../img/favicon.ico'),
      type: "img/ico",
    }]


    return (
      <CursorProvider>
        <HotkeyProvider>

          <div>
            <Helmet link={faviconConfig} />
            <Header theme={headerTheme} params={this.props.params} maximize={maximize}/>
            <div className="body">
              { this.props.children }
            </div>
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
