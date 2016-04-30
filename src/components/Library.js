import React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { phraseLoad } from 'reducers/reducePhrase'

let Library = ({ phrases, dispatch }) => {
  return (
    <div className="library">
      <div className="library-browser">
        Search Phrases
      </div>

      { phrases.map(phrase =>
        <div
          key={phrase.id}
          style={{cursor: `pointer`}}
          onClick={
            () => {
              dispatch(phraseLoad(phrase.state))
              dispatch(push('/edit'))
            }
          }
        >
          {phrase.name}
        </div>
      )}
    </div>
  )
}

export default connect(state => state.library)(Library)
