import React, { Component } from 'react'
import withAudioEngine from '../audio/AudioEngineConnect.js'
import Dropdown from 'react-bootstrap/lib/Dropdown'

export class ControllerMidiConnectivity extends Component {

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

    if (this.props.iconOnly) {
      return (
        <span
          className={signalClasses}
          style={{ marginLeft: -5, marginBottom: -6, marginRight: -6 }}
        />
      )
    }

    if ("DUMMY EXPRESSION TO DISABLE DROPDOWN") {
      return (
        <span>
          <span className={signalClasses} />
          <span style={{ paddingLeft: 4 }}>
            {
              this.state.controllers.length
                ? `Connected to ${this.state.controllers.length} MIDI ports`
                : "No MIDI Controller detected"
            }
          </span>
        </span>
      )
    }

    return (
      <Dropdown id="workstation-footer-midi-controllers" dropup className="dropdown-dark">
        <a className="btn btn-narrow btn-link btn-sm link-dark dropdown-toggle" bsRole="toggle">
          <span className={signalClasses} />
          <span className="fa fa-plug" />
          <span> External MIDI Controller</span>
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

export default withAudioEngine(ControllerMidiConnectivity)
