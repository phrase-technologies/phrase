import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import _ from 'lodash'
import Instruments from 'instruments'
import { phraseUpdateTrackConfig } from 'reducers/reducePhrase'
import NewRibbon from 'components/NewRibbon'

function Rack ({ track, update }) {
  let InstrumentInterface = Instruments[track.instrument.id].Interface
  return (
    <div className="rack-container">
      <div className="rack-settings">
        <button
          className={ `btn btn-dark btn-narrow` }
          //onClick={() => dispatch(arrangeToolSelect(`scissors`))}
        >
          Change Instrument
        </button>
      </div>
      <div className="rack-item">
        <InstrumentInterface track={track} update={update} />
      </div>
      <NewRibbon text=" Add Plugin" />
    </div>
  )
}

function mapDispatchToProps(dispatch, {track: {id}}) {
  return { update: bindActionCreators(_.partial(phraseUpdateTrackConfig, id), dispatch) }
}

export default connect(null, mapDispatchToProps)(Rack)
