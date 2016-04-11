import React from 'react'

import Header from 'components/Header.js'
import Library from 'components/Library.js'
import Workstation from 'components/Workstation.js'

export default (props) => {
  let maximized = (props.route.path === '/edit')

  return (
    <div>
      <Header />
      <Library />
      <Workstation maximized={maximized} />
    </div>
  )
}
