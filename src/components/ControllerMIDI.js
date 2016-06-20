import React, { Component } from 'react'
import withAudioEngine from '../audio/AudioEngineConnect.js'
import Dropdown from 'react-bootstrap/lib/Dropdown'

export class ControllerMIDI extends Component {

  constructor() {
    super()
    this.state = {
      refreshingConnections: false,
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

  refreshConnections = async () => {
    this.setState({ refreshingConnections: true })
    let controllers = await this.props.ENGINE.getMIDIControllers()
    this.setState({
      controllers,
      refreshingConnections: false,
    })
  }

  componentWillMount() {
    this.refreshConnections()
    this.refreshInterval = setInterval(this.refreshConnections, 1250)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState !== this.state
  }

  componentWillUnmount() {
    clearInterval(this.refreshInterval)
  }

}

export default withAudioEngine(ControllerMIDI)
