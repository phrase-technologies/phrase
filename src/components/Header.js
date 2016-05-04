import React from 'react'
import { Link } from 'react-router'
import UserNavigation from 'components/UserNavigation.js'

let Header = (props) => {
  let theme = 'solid' || props.theme
  let headerClasses = "header"
      headerClasses += (theme === 'solid') ? ' header-solid' : ''
  let searchClasses = "form-control header-search"
      searchClasses += (theme === 'solid') ? ' form-control-dark' : ''
  let buttonClasses = "btn btn-link"
      buttonClasses += (theme === 'solid') ? ' link-dark' : ''

  return (
    <div className={headerClasses}>
      <div className="btn-toolbar pull-left">
        <div className="btn-group">
          <div className="header-search-wrapper">
            <input
              className={searchClasses}
              type="text" placeholder="Search Phrases"
            />
            <span className="header-search-icon fa fa-search" />
          </div>
        </div>
        <div className="btn-group">
          <Link className={buttonClasses} to="/phrase/new">
            <span>+ </span>
            <span className="fa fa-file" />
            <span> New Phrase</span>
          </Link>
        </div>
      </div>
      <div className="header-logo" />
      <div className="btn-toolbar pull-right">
        <div className="btn-group" style={{ marginRight: 10 }}>
          <Link className={buttonClasses} to="/about" activeClassName="header-nav-active">
            About
          </Link>
          <Link className={buttonClasses} to="/developers" activeClassName="header-nav-active">
            Developers
          </Link>
        </div>
        <UserNavigation />
      </div>
    </div>
  )
}
export default Header
