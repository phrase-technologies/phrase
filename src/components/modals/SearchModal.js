import React from 'react'
import { connect } from 'react-redux'
import Instruments from 'instruments'
import _ from 'lodash'
import { phraseChangeInstrument } from 'reducers/reducePhrase'

let SearchModal = ({ show, trackSelectionID, dispatch }) => !show ? null :
  <div className="search-box">
    <input
      autoFocus
      className="search-box-input"
      placeholder="Start typing to find an instrument or plugin by name or tag, eg. filter, distortion"
    />
    <div style={{ display: `flex` }}>
      { Object.keys(Instruments).map(id =>
        <div key={id} style={{ flex: 2 }}>
          <div className="search-result-id">
            {id} <span className="search-result-author">{Instruments[id].Meta.author}</span>
          </div>
          <div className="search-result-description">{Instruments[id].Meta.description}</div>
          <button
            className="search-result-add-btn"
            onClick={() => dispatch(phraseChangeInstrument(trackSelectionID, Instruments[id].Meta))}
          >
            SET AS TRACK INSTRUMENT
          </button>
        </div>
      )}
    </div>
  </div>

export default connect(state => state.phraseMeta)(SearchModal)
