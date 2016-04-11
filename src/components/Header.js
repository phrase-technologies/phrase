import React from 'react'

import UserNavigation from 'components/UserNavigation.js'

export default () => {
  return (
    <div className="header">
      <div className="header-logo"></div>
      <input className="form-control header-search" type="text" placeholder="Search Phrases" />
      <UserNavigation />
    </div>
  )
}
