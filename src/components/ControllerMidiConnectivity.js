import React, { Component } from 'react'
import { connect } from 'react-redux'
import Dropdown from 'react-bootstrap/lib/Dropdown'
import diffProps from 'helpers/diffProps'

export class ControllerMidiConnectivity extends Component {

  render() {
    let signalClasses = "signal"
        signalClasses += this.props.numPorts
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
              this.props.numPorts
                ? `Connected to ${this.props.manufacturers.join(', ')} (${this.props.numPorts} ports)`
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
    if (this.props.numPorts) {
      return this.props.manufacturers.map((manufacturer, i) => {
        return (
          <li key={i}>
            <a>
              <span className="fa fa-check text-success" />
              <span> {manufacturer}</span>
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

  shouldComponentUpdate(nextProps) {
    return diffProps(nextProps, this.props, [
      'numPorts',
      'manufacturers'
    ])
  }

}

function mapStateToProps(state) {
  return {
    ...state.midi
  }
}
export default connect(mapStateToProps)(ControllerMidiConnectivity)
