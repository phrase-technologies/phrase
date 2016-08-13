import React from 'react'
import { connect } from 'react-redux'

import Header from 'components/Header'
import AuthenticationWall from 'components/AuthenticationWall'

export let App = ({ dispatch, routes, params, children, location }) => {

  let loggedIn = localStorage.userId && localStorage.userId !== 'undefined'
  let showHeader = routes[2].path
  let bodyStyle = showHeader ? {} : { top: 0 }
  let maximize = routes[2].maximize
  let headerTheme = true ? 'solid' : 'clear'

  if (!loggedIn) {
    let authenticationWallProps = {
      dispatch,
      inviteCode: location.query.inviteCode,
    }
    return (
      <AuthenticationWall {...authenticationWallProps} />
    )
  }

  return (
    <div>
      <Header theme={headerTheme} params={params} maximize={maximize} show={showHeader} />
      <div className="body" style={bodyStyle}>
        { children }
      </div>
    </div>
  )

}

function mapStateToProps(state) {
  return {
    ...state.modal,
    ...state.auth,
  }
}

export default connect(mapStateToProps)(App)
