import React, { Component } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'

import * as AllModals from 'components/modals'
import SignupModal from 'components/modals/SignupModal'

export class AuthenticationWall extends Component {

  constructor() {
    super()
    this.state = {
      activeModal: 'SignupModal',
    }
  }

  render() {
    let ActiveModal = AllModals[this.state.activeModal]
    return (
      <div className="authentication-wall">

        <div>
          <h1 className="authentication-wall-notice">
            <span className="fa fa-warning" style={{ color: '#FC0' }} />
            <span> Invite-only access is required to view this page</span>
          </h1>

          <div className="authentication-wall-modal">
            <ActiveModal embedded={true} inviteCode={this.props.inviteCode} />
          </div>

          <div className="authentication-wall-footer">
            <Link to="/">
              <img className="authentication-wall-logo" src={require('../img/phrase-logo-white-text-2015-12-09.png')} />
            </Link>
            <p>
              <Link to="/">Click here</Link>
              <span> to learn more about Phrase.</span>
            </p>
          </div>
        </div>

      </div>
    )
  }

  componentWillReceiveProps(nextProps) {
    switch(nextProps.activeModal) {
      case 'LoginModal':
      case 'SignupModal':
        this.setState({ activeModal: nextProps.activeModal })
        break
      default:
        this.setState({ activeModal: this.state.activeModal || SignupModal })
    }
  }

}

function mapStateToProps(state) {
  return {
    ...state.modal
  }
}
export default connect(mapStateToProps)(AuthenticationWall)
