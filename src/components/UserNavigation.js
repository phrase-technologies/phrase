import React, { Component } from 'react'
import { connect } from 'react-redux'

import AuthenticationModal from './AuthenticationModal'

import { logout } from '../reducers/reduceAuth.js'

export class UserNavigation extends Component {
  constructor() {
    super()
    this.state = {
      dropdownOpen: false
    }
  }

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
    let dropdownClass = 'header-user-navigation dropdown'
        dropdownClass += this.state.dropdownOpen ? ' open' : ''

    return (
      <div className={dropdownClass}>
        <a className="dropdown-toggle" onClick={this.toggleDropdown}>
          <img className="header-user-profile-pic" src={profileImageUrl} />
          <span className="header-user-name">Anson Kao <span className="caret" /></span>
        </a>
        <ul className="dropdown-menu pull-right">
          <li><a>Profile</a></li>
          <li role="separator" className="divider"></li>
          <li><a onClick={this.logout}>Log out</a></li>
        </ul>
      </div>
    )
  }

  toggleDropdown = () => {
    this.setState({ dropdownOpen: !this.state.dropdownOpen })
  }

  logout = () => {
    this.setState({ dropdownOpen: false })
    this.props.dispatch(logout())
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  }
}

export default connect(mapStateToProps)(UserNavigation)
