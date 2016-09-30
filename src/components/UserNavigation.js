import React from 'react'
import { connect } from 'react-redux'
import { MenuItem } from 'react-bootstrap'
import Dropdown from 'react-bootstrap/lib/Dropdown'
import { push } from 'react-router-redux'

import UserBubble from 'components/UserBubble'
import { logout } from 'reducers/reduceAuth'

export let UserNavigation = (props) => {
  let buttonClasses = "btn btn-link"
      buttonClasses += (props.theme === 'solid') ? ' link-dark' : ''

  return (
    <div className="btn-toolbar pull-right">
      {/*
      <div className="btn-group" style={{ marginRight: 10 }}>
        <Link className={buttonClasses} to="/about" activeClassName="header-nav-active">
          About
        </Link>
        <Link className={buttonClasses} to="/developers" activeClassName="header-nav-active">
          Developers
        </Link>
        <Link className={buttonClasses} to="/contact" activeClassName="header-nav-active">
          Contact
        </Link>
        { notificationButton({ loggedIn: props.loggedIn }) }
      </div>
      */}
      {
        !props.loggedIn
          ? notLoggedIn(props)
          : loggedIn(props)
      }
    </div>
  )
}

let notificationButton = ({ loggedIn }) => {
  let notifications = 0

  if (loggedIn && notifications) {
    return (
      <a className="btn btn-link link-dark">
        <span className="fa fa-bell" />
        <span className="notification-count">
          { notifications }
        </span>
      </a>
    )
  }

  return null
}

let notLoggedIn = ({ dispatch }) => {
  return (
    <div className="btn-group" key={2}>
      <button
        className="btn btn-dark"
        onClick={() => dispatch(modalOpen({ modalComponent: 'SignupModal' }))}
      >
        Log in
      </button>
    </div>
  )
}

let loggedIn = ({ user, dispatch }) => {

  return (
    <Dropdown id="header-user-navigation-dropdown" pullRight className="dropdown-arrow" style={{ marginTop: 3 }}>
      <div className="header-user-profile-pic">
        <UserBubble userId={user.id} />
      </div>
      <a className="dropdown-toggle" bsRole="toggle">
        <span className="header-user-name">{user.username || user.email} <span className="caret" /></span>
      </a>
      <Dropdown.Menu>
        <MenuItem onClick={() => dispatch(push(`/user/${user.username}`))}>Profile</MenuItem>
        <MenuItem divider/>
        <MenuItem onClick={() => dispatch(logout())}>Log out</MenuItem>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default connect(state => ({ ...state.auth }))(UserNavigation)
