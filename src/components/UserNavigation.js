import React from 'react'
import { connect } from 'react-redux'
import Dropdown from 'react-bootstrap/lib/Dropdown'
import { Link } from 'react-router'

import { modalOpen } from 'reducers/reduceModal'
import { logout } from 'reducers/reduceAuth'
// import profileImageUrl from '../img/user/anson-kao.jpg'

export let UserNavigation = (props) => {
  let buttonClasses = "btn btn-link"
      buttonClasses += (props.theme === 'solid') ? ' link-dark' : ''

  return (
    <div className="btn-toolbar pull-right">
      <div className="btn-group" style={{ marginRight: 10 }}>
        <Link className={buttonClasses} to="/about" activeClassName="header-nav-active">
          About
        </Link>
        {/*
        <Link className={buttonClasses} to="/developers" activeClassName="header-nav-active">
          Developers
        </Link>
        <Link className={buttonClasses} to="/contact" activeClassName="header-nav-active">
          Contact
        </Link>
        */}
        { notificationButton({ loggedIn: props.loggedIn }) }
      </div>
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
  let userProfileUri = `/user/${user.username}`

  return (
    <Dropdown id="header-user-navigation-dropdown" pullRight className="dropdown-arrow" style={{ marginTop: 7 }}>
      <a className="dropdown-toggle" bsRole="toggle">
        {/*<img className="header-user-profile-pic" src={profileImageUrl} />*/}
        <span className="header-user-name">{user.username || user.email} <span className="caret" /></span>
      </a>
      <Dropdown.Menu>
        <li>
          <Link to={userProfileUri} activeClassName="header-nav-active">
            Profile
          </Link>
        </li>
        <li role="separator" className="divider"></li>
        <li>
          <a onClick={ () => dispatch(logout()) }>
            Log out
          </a>
        </li>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default connect(state => state.auth)(UserNavigation)
