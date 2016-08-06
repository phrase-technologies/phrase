import React, { Component } from 'react'
import { connect } from 'react-redux'

import ControllerMidiConnectivity from 'components/ControllerMidiConnectivity'
import PianorollKeys from 'components/PianorollKeys.js'
import diffProps from 'helpers/diffProps'

export class ExternalMidiController extends Component {

  render() {
    if (this.props.connectionAvailable) {
      return (
        <div className="midi-controller">
          <p className="text-center">
            Simply plug your MIDI controller in and we'll
            automatically detect it.
          </p>
          <div className="midi-controller-piano">
            <PianorollKeys midiController={true} />
          </div>
          <p className="text-center">
            <ControllerMidiConnectivity />
          </p>
        </div>
      )
    }

    return (
      <div className="midi-controller">
        <p className="text-center">
          The latest version of Google Chrome browser is required
          for external MIDI support. Open Phrase in Chrome, and
          your MIDI controller will be automatically detected.
        </p>
        <p className="text-center" style={{ marginTop: 35 }}>
          <a className="btn btn-bright" href="https://www.google.com/chrome/browser/" target="_blank">
            <img
              src={require('../img/google-chrome.png')}
              width={60} style={{ margin: '-20px 5px -20px -5px' }}
            />
            Download Chrome
          </a>
        </p>
      </div>
    )
  }

  shouldComponentUpdate(nextProps) {
    return diffProps(nextProps, this.props, [
      'connectionAvailable',
    ])
  }

}

function mapStateToProps(state) {
  return {
    connectionAvailable: state.midi.connectionAvailable,
  }
}

export default connect(mapStateToProps)(ExternalMidiController)
