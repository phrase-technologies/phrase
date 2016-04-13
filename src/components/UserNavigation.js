import React, { Component } from 'react'
import { connect } from 'react-redux'
import Dropdown from 'react-bootstrap/lib/Dropdown'

import AuthenticationModal from './AuthenticationModal'

import { logout } from '../reducers/reduceAuth.js'

export class UserNavigation extends Component {
  render() {
    if (!this.props.loggedIn) {
      return (
        <div className="header-user-navigation">
          <button className="btn btn-dark" type="button">Log in</button>
          <button className="btn btn-bright" type="button">Sign up</button>
          <AuthenticationModal returningUser={true} {...this.props} />
        </div>
      )
    }

    let profileImageUrl = require('../img/user/anson-kao.jpg')

    return (
      <Dropdown id="header-user-navigation-dropdown" className="header-user-navigation" pullRight>
        <a className="dropdown-toggle" bsRole="toggle" onClick={this.preventDefault}>
          <img className="header-user-profile-pic" src={profileImageUrl} />
          <span className="header-user-name">{this.props.user.email} <span className="caret" /></span>
        </a>
        <Dropdown.Menu>
          <li><a>Profile</a></li>
          <li role="separator" className="divider"></li>
          <li><a onClick={this.logout}>Log out</a></li>
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  preventDefault = (e) => e.preventDefault()

  logout = () => this.props.dispatch(logout())
}

function mapStateToProps(state) {
  return {
    ...state.auth
  }
}

export default connect(mapStateToProps)(UserNavigation)
