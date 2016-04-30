import React from 'react'
import { connect } from 'react-redux'
import Dropdown from 'react-bootstrap/lib/Dropdown'

import { modalOpen } from 'reducers/reduceModal'
import { logout } from 'reducers/reduceAuth'
import profileImageUrl from '../img/user/anson-kao.jpg'

export let UserNavigation = props => !props.loggedIn
  ? notLoggedIn(props)
  : loggedIn(props)

let notLoggedIn = ({ dispatch }) =>
  <div className="header-user-navigation">
    <button
      className="btn btn-dark"
      onClick={() => dispatch(modalOpen({ modalComponent: 'LoginModal' }))}
    >
      Log in
    </button>
    <button
      className="btn btn-bright"
      onClick={() => dispatch(modalOpen({ modalComponent: 'SignupModal' }))}
    >
      Sign up
    </button>
  </div>

let loggedIn = ({ user, dispatch }) =>
  <div style={{ display: `flex` }}>
    <Dropdown id="header-user-navigation-dropdown" className="header-user-navigation" pullRight>
      <a className="dropdown-toggle" bsRole="toggle" onClick={e => e.preventDefault()}>
        <img className="header-user-profile-pic" src={profileImageUrl} />
        <span className="header-user-name">{user.username || user.email} <span className="caret" /></span>
      </a>
      <Dropdown.Menu>
        <li><a>Profile</a></li>
        <li role="separator" className="divider"></li>
        <li><a onClick={ () => dispatch(logout()) }>Log out</a></li>
      </Dropdown.Menu>
    </Dropdown>
  </div>

export default connect(state => state.auth)(UserNavigation)
