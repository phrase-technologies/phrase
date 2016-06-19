import React, { Component } from 'react'
import ControllerMIDI from 'components/ControllerMIDI'

export default class WorkstationFooter extends Component {

  render() {
    return (
      <div className="workstation-footer">
        <div className="btn-toolbar">
          <div className="btn-group">
            <ControllerMIDI />
          </div>
        </div>
      </div>
    )
  }

  shouldComponentUpdate() {
    return false
  }

}
