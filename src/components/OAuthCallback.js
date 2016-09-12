import React, { Component } from 'react'
import { connect } from 'react-redux'

export class OAuthCallback extends Component {
  componentWillMount = () => {
    window.opener.oAuthCallback(this.props.location.query)
    window.close()
  }

  render = () => {
    return <div></div>
  }

}

export default connect()(OAuthCallback)
