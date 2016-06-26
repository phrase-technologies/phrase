import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Instruments from 'instruments'
import { phraseUpdateTrackConfig } from 'reducers/reducePhrase'

function Rack ({ track, update }) {
  let InstrumentInterface = Instruments[track.instrument.id].Interface
  return (
    <div className="rack-container">
      <div className="rack-item">
        <InstrumentInterface track={track} update={update} />
      </div>
    </div>
  )
}

function mapDispatchToProps(dispatch) {
  return { update: bindActionCreators(phraseUpdateTrackConfig, dispatch) }
}

export default connect(null, mapDispatchToProps)(Rack)
