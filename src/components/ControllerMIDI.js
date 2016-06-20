import React, { Component } from 'react'
import withAudioEngine from '../audio/AudioEngineConnect.js'
import Dropdown from 'react-bootstrap/lib/Dropdown'

export class ControllerMIDI extends Component {

  constructor() {
    super()
    this.state = {
      controllers: [],
    }
  }

  render() {
    let signalClasses = "signal"
        signalClasses += this.state.controllers.length
          ? " signal-green"
          : " signal-red"

    return (
      <Dropdown id="workstation-footer-midi-controllers" dropup className="dropdown-dark">
        <a className="btn btn-dark dropdown-toggle" bsRole="toggle">
          <span className={signalClasses} />
          <span className="fa fa-plug" />
          <span> MIDI Controller ({ this.state.controllers.length || "N/A" }) </span>
          <span className="caret" />
        </a>
        <Dropdown.Menu>
          { this.renderDropdownMenu() }
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  renderDropdownMenu() {
    if (this.state.controllers.length) {
      return this.state.controllers.map((controller, i) => {
        return (
          <li key={i}>
            <a>
              <span className="fa fa-check text-success" />
              <span>{` ${controller.manufacturer} - ${controller.name}`}</span>
            </a>
          </li>
        )
      })
    }

    return (
      <li>
        <a>
          No MIDI Controller detected.
        </a>
      </li>
    )
  }

  refreshConnections = (controllers) => {
    this.setState({ controllers })
  }

  componentWillMount() {
    this.props.ENGINE.midiControl.registerSynchronizationCallback(this.refreshConnections)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState !== this.state
  }

  componentWillUnmount() {
    this.props.ENGINE.midiControl.destroySynchronizationCallback()
  }

}

export default withAudioEngine(ControllerMIDI)
