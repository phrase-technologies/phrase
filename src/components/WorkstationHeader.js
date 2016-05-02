import React from 'react'

import WorkstationHeaderTitle from './WorkstationHeaderTitle.js'
import WorkstationHeaderAuthor from './WorkstationHeaderAuthor.js'
import WorkstationHeaderStorage from './WorkstationHeaderStorage.js'
import WorkstationHeaderShare from './WorkstationHeaderShare.js'
import Transport from './Transport.js'

export default (props) => {
  return (
    <div className="workstation-header" onClick={props.maximize}>
      <Transport />
      <div className="workstation-header-info">
        <div className="btn-toolbar">
          <div className="btn-group">
            <WorkstationHeaderTitle title="" />
            <WorkstationHeaderAuthor />
          </div>
          <WorkstationHeaderStorage />
          <div className="btn-group">
            <span className="workstation-header-share">
              Share:
            </span>
          </div>
          <WorkstationHeaderShare />
        </div>
      </div>
    </div>
  )
}
