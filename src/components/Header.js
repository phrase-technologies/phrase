import React from 'react'
import { Link } from 'react-router'
import HeaderSearch from 'components/HeaderSearch.js'
import UserNavigation from 'components/UserNavigation.js'
import { connect } from 'react-redux'

export let Header = (props) => {
  let theme = 'solid' || props.theme
  let headerClasses = "header"
      headerClasses += (theme === 'solid') ? ' header-solid' : ''
  let buttonClasses = "btn btn-link"
      buttonClasses += (theme === 'solid') ? ' link-dark' : ''

  return (
    <div className={headerClasses}>
      <div className="container">
        <div className="btn-toolbar pull-left">
          <HeaderSearch theme={theme} />
          <div className="btn-group">
            <Link className={buttonClasses} to="/phrase/new">
              <span>+ </span>
              <span className="fa fa-file" />
              <span> New Phrase</span>
            </Link>
          </div>
        </div>
        <div className="header-logo" />
        <UserNavigation theme={theme} />
      </div>
    </div>
  )
}

export default connect()(Header)
