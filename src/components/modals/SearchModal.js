import React from 'react'
import { connect } from 'react-redux'
import Plugins from 'plugins'
import { phraseChangeInstrument } from 'reducers/reducePhrase'

let SearchModal = ({ show, trackSelectionID, dispatch }) => !show ? null :
  <div className="search-box">
    <input
      autoFocus
      className="search-box-input"
      placeholder="Start typing to find an instrument or plugin by name or tag, eg. filter, distortion"
    />
    <div style={{ display: `flex` }}>
      { Object.keys(Plugins).map(id =>
        <div key={id} style={{ flex: 2 }}>
          <div className="search-result-id">
            {id} <span className="search-result-author">{Plugins[id].Meta.author}</span>
          </div>
          <div className="search-result-description">{Plugins[id].Meta.description}</div>
          <button
            className="search-result-add-btn"
            onClick={() => dispatch(phraseChangeInstrument(trackSelectionID, Plugins[id].Meta))}
          >
            SET AS TRACK INSTRUMENT
          </button>
        </div>
      )}
    </div>
  </div>

export default connect(state => state.phraseMeta)(SearchModal)
