import React, { Component } from 'react'
import { connect } from 'react-redux'

import Header from 'components/Header'
import Library from 'components/Library'
import Workstation from 'components/Workstation'

import * as AllModals from 'components/modals'

import { libraryLoadAll } from 'reducers/reduceLibrary'
import { phraseLoadFromDb } from 'reducers/reducePhrase'

export class App extends Component {
  componentDidMount() {
    let { dispatch, params } = this.props
    dispatch(libraryLoadAll())

    /*
     *  Attempt to load user's phrase from url.
     */

    if (params.phrasename) {
      dispatch(phraseLoadFromDb(params.phrasename))
    }
  }

  render() {
    let ActiveModal = this.props.activeModal ? AllModals[this.props.activeModal] : 'div'
    let maximized = this.props.route.path.includes('/edit')

    return (
      <div>
        <Header />
        <Library />
        <Workstation maximized={maximized} />
        <ActiveModal show={this.props.show} />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    ...state.modal
  }
}
export default connect(mapStateToProps)(App)
