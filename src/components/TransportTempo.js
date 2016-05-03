import React, { Component } from 'react'
import { connect } from 'react-redux'

import { phraseSetTempo } from 'reducers/reducePhrase.js'

class TransportTempo extends Component {
  render() {
    return (
      <div className="btn-group">
        <div className="transport-tempo-container">
          <input className="form-control form-control-glow transport-tempo"
            type="number" min={1} max={999} step={1} value={this.props.tempo}
            onChange={this.handleChange}
          />
          <span>BPM</span>
        </div>
      </div>
    )
  }

  handleChange = (e) => {
    this.props.dispatch(phraseSetTempo(e.target.value))
  }
}

function mapStateToProps(state) {
  return {
    tempo:   state.phrase.present.tempo,
  }
}

export default connect(mapStateToProps)(TransportTempo)
