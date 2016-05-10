import React from 'react'

import WorkstationHeaderTitle from './WorkstationHeaderTitle.js'
import WorkstationHeaderAuthor from './WorkstationHeaderAuthor.js'
import WorkstationHeaderStorage from './WorkstationHeaderStorage.js'
import WorkstationHeaderShare from './WorkstationHeaderShare.js'
import TransportTempo from './TransportTempo.js'
import TransportControls from './TransportControls.js'

export default (props) => {
  let maximizeButton = props.maximized ? null : (
    <button className="btn btn-bright"
      style={{ position: 'absolute', top: 0, right: 15 }}
      onClick={props.maximize}
    >
      <span className="fa fa-pencil-square-o" />
      <span> Open in Phrase Editor</span>
    </button>
  )

  return (
    <div className="workstation-header">
      <div className="container" style={{ position: 'relative' }}>
        {maximizeButton}
        <div className="text-center">
          <div className="btn-group">
            <WorkstationHeaderTitle />
            <WorkstationHeaderAuthor />
          </div>
        </div>
      </div>
      <div className="workstation-divider" />
      <WorkstationHeaderStorage style={{ position: 'absolute', top: 65, left: 10 }} />
      <div className="text-center">
        <div className="btn-toolbar" style={{ display: 'inline-block' }}>
          <TransportTempo />
          <TransportControls />
        </div>
      </div>
      <div className="btn-toolbar" style={{ position: 'absolute', top: 65, right: 10 }}>
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
