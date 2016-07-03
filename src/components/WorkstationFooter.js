import React, { Component } from 'react'
import ControllerMIDI from 'components/ControllerMIDI'

import { layout } from 'actions/actions'
import { layoutConsoleSplit } from 'reducers/reduceNavigation'

export default class WorkstationFooter extends Component {

  render() {
    let multitrackClass = 'btn btn-sm btn-link link-dark btn-glow'
        multitrackClass += this.isMultitrackActive() ? ' active' : ''
    let trackClass = 'btn btn-sm btn-link link-dark btn-glow'
        trackClass += this.isTrackActive() ? ' active' : ''
    let rackClass = 'btn btn-sm btn-link link-dark btn-glow'
        rackClass += this.isRackActive() ? ' active' : ''

    return (
      <div className="workstation-footer">
        <div className="btn-toolbar">
          <div className="btn-group">
            <div className="btn btn-dark btn-sm">
              <img src={require('img/pianoroll.gif')} height={14} style={{ verticalAlign: 'sub' }} />
              <span> Musical Typing </span>
              <span className="fa fa-search-plus" />
            </div>
          </div>
          <div className="btn-group">
            <ControllerMIDI />
          </div>
          <div className="btn-group pull-right">
            <div className={multitrackClass} onClick={this.toggleMultitrack}>
              <span> Multitrack</span>
            </div>
            <div className={trackClass} onClick={this.toggleTrack}>
              <span> Track</span>
            </div>
            <div className={rackClass} onClick={this.toggleRack}>
              <span> Effects Rack</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  isMultitrackActive() {
    return this.props.consoleSplitRatio === null || this.props.consoleSplitRatio >= 0.2
  }

  isTrackActive() {
    return this.props.consoleSplitRatio !== null && this.props.consoleSplitRatio <= 0.8
  }

  isRackActive() {
    return this.props.rackOpen
  }

  toggleMultitrack = () => {
    if (Number.isInteger(this.props.focusedTrack)) {
      let newRatio = this.isMultitrackActive() ? 0.0 : 0.5
      this.props.dispatch(layoutConsoleSplit(newRatio))
    }
  }

  toggleTrack = () => {
    if (Number.isInteger(this.props.focusedTrack)) {
      let newRatio = this.isTrackActive() ? 1.0 : 0.5
      this.props.dispatch(layoutConsoleSplit(newRatio))
    }
  }

  toggleRack = () => {
    this.props.dispatch({ type: layout.TOGGLE_RACK })
  }

}
