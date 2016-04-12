import React from 'react'

import AuthenticationModal from './AuthenticationModal'

export default () => {
  if ('NO USER LOGGED IN') {
    return (
      <div className="header-user-navigation">
        <button className="btn btn-dark" type="button">Log in</button>
        <button className="btn btn-bright" type="button">Sign up</button>
        <AuthenticationModal returningUser={true} />
      </div>
    )
  }

  let profileImageUrl = require('../img/user/anson-kao.jpg')

  return (
    <a className="header-user-navigation">
      <img className="header-user-profile-pic" src={profileImageUrl} />
      <span className="header-user-name">Anson Kao <span className="caret" /></span>
    </a>
  )
}
