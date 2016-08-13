import React from 'react'
import { Link } from 'react-router'

import { modalOpen } from 'reducers/reduceModal'

export default ({ dispatch, inviteCode }) => {

  return (
    <div className="authentication-wall">

      <nav className="landing-page-header">
        <ul className="landing-page-header-menu">
          <li>
            <a onClick={() => dispatch(modalOpen({ modalComponent: 'LoginModal' }))}>
              <span className="fa fa-sign-in" /><span> Login</span>
            </a>
          </li>
        </ul>
      </nav>

      <div>
        <h1 className="authentication-wall-notice">
          <span className="fa fa-warning" />
          <span> Invite-only access is required to view this page</span>
        </h1>

        <ul className="authentication-wall-actions list-group">
          <a className="list-group-item" onClick={() => dispatch(modalOpen({ modalComponent: 'SignupModal' }))}>
            {
              inviteCode
                ? <span>Use invite code <strong>{inviteCode}</strong></span>
                : "I have an invite code"
            }
          </a>
          <a className="list-group-item" onClick={() => dispatch(modalOpen({ modalComponent: 'LoginModal' }))}>
            Login to an existing account
          </a>
        </ul>

        <Link to="/">
          <img className="authentication-wall-logo" src="/img/phrase-logo-white-text-2015-12-09.png" />
        </Link>
        <p>
          <Link to="/">Click here</Link>
          <span> to learn more about Phrase.</span>
        </p>
      </div>

    </div>
  )
}
