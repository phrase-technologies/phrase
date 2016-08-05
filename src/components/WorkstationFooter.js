import React, { Component } from 'react'
import InputMethodsTour from 'components/InputMethodsTour'
import ControllerMidiConnectivity from 'components/ControllerMidiConnectivity'

import { layout } from 'actions/actions'
import { layoutConsoleSplit } from 'reducers/reduceNavigation'

export default class WorkstationFooter extends Component {

  constructor() {
    super()
    this.state = {
      openInputMethod: null,
    }
  }

  render() {
    let multitrackClass = 'btn btn-sm btn-link link-dark btn-glow'
        multitrackClass += this.isMultitrackActive() ? ' active' : ''
    let trackClass = 'btn btn-sm btn-link link-dark btn-glow'
        trackClass += this.isTrackActive() ? ' active' : ''
    let rackClass = 'btn btn-sm btn-link link-dark btn-glow'
        rackClass += this.isRackActive() ? ' active' : ''

    return (
      <div className="workstation-footer">
        <InputMethodsTour
          show={this.state.openInputMethod !== null}
          openInputMethod={this.state.openInputMethod}
          setOpenInputMethod={this.setOpenInputMethod}
        />
        <div className="btn-toolbar">
          <div className="btn-group">
            <div
              className="btn btn-link btn-sm link-dark"
              onClick={() => this.setOpenInputMethod(0)}
            >
              <span>Input Methods: </span>
            </div>
            <div
              className="btn btn-link btn-sm link-dark btn-glow active"
              onClick={() => this.setOpenInputMethod(1)}
            >
              <span className="phrase-icon-pianoroll" />
              <ControllerMidiConnectivity iconOnly={true} />
            </div>
            <div
              className="btn btn-link btn-sm link-dark btn-glow active"
              onClick={() => this.setOpenInputMethod(2)}
            >
              <span className="fa fa-keyboard-o" />
            </div>
            <div
              className="btn btn-link btn-sm link-dark btn-glow active"
              onClick={() => this.setOpenInputMethod(3)}
            >
              <span className="fa fa-mouse-pointer" />
            </div>
            <div
              className="btn btn-link btn-sm link-dark btn-glow"
              onClick={() => this.setOpenInputMethod(4)}
            >
              <span className="fa fa-microphone" />
            </div>
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

  setOpenInputMethod = (eventKey) => {
    this.setState({ openInputMethod: eventKey })

    // Avoid the carousel controls remaining focused, which prevents hotkeys from working
    setTimeout(() => document.activeElement.blur(), 0)
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
