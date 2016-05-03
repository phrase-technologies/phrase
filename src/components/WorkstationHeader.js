import React from 'react'

import WorkstationHeaderTitle from './WorkstationHeaderTitle.js'
import WorkstationHeaderAuthor from './WorkstationHeaderAuthor.js'
import WorkstationHeaderStorage from './WorkstationHeaderStorage.js'
import WorkstationHeaderShare from './WorkstationHeaderShare.js'
import TransportTempo from './TransportTempo.js'
import TransportControls from './TransportControls.js'

export default (props) => {
  return (
    <div className="workstation-header" onClick={props.maximize}>
      <div className="btn-toolbar pull-left">
        <TransportTempo />
        <TransportControls />
      </div>
      <div className="btn-toolbar pull-right">
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
  )
}
