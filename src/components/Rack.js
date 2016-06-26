import React from 'react'
import { connect } from 'react-redux'
import Instruments from 'instruments'

function Rack ({ track, dispatch }) {
  let InstrumentInterface = Instruments[track.instrument.id].Interface
  return (
    <div className="rack-container">
      <div className="rack-item">
        <InstrumentInterface track={track} dispatch={dispatch} />
      </div>
    </div>
  )
}

export default connect()(Rack)
