import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import _ from 'lodash'
import Instruments from 'instruments'
import { phraseUpdateTrackConfig } from 'reducers/reducePhrase'
import NewRibbon from 'components/NewRibbon'
import { modalOpen } from 'reducers/reduceModal'

function Rack ({ track, update, modalOpen }) {
  let InstrumentInterface = Instruments[track.instrument.id].Interface
  return (
    <div className="rack-container">
      <div className="rack-item">
        <InstrumentInterface track={track} update={update} />
      </div>

      <NewRibbon
        handleClick={() => modalOpen({ modalComponent: `SearchModal` })}
        text=" Change Instrument / Add Plugin"
      />
    </div>
  )
}

function mapDispatchToProps(dispatch, { track: { id } }) {
  return {
    update: bindActionCreators(_.partial(phraseUpdateTrackConfig, id), dispatch),
    modalOpen: bindActionCreators(modalOpen, dispatch)
  }
}

export default connect(null, mapDispatchToProps)(Rack)
