import React from 'react'
import UserNavigation from 'components/UserNavigation.js'

let Header = () =>
  <div className="header">
    <div className="header-logo" />
    <input className="form-control header-search" type="text" placeholder="Search Phrases" />
    <UserNavigation />
  </div>

export default Header
