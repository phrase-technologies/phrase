import { createStore, compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { expect } from 'chai'

import {
  phraseCreateClip,
  phraseCreateNote,
  phraseQuantizeSelection,
  phraseSelectNote,
} from 'reducers/reducePhrase'
import { changeQuantizeDivision } from 'reducers/reduceQuantizer'

import { testReducer } from 'reducers/reduce'

let finalCreateStore = compose(applyMiddleware(thunk))(createStore)

describe('Quantizer', () => {

  let store

  beforeEach(() => store = finalCreateStore(testReducer))

  describe(`Quantize note selection`, () => {
    it(`notes should be quantized to the proper division marker`, () => {
      let trackID = 0

      store.dispatch(changeQuantizeDivision('1/4'))
      store.dispatch(phraseCreateClip({ trackID, start: 0.5 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0, key: 36.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.124, key: 37.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.125, key: 38.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.126, key: 39.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.25, key: 40.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.374, key: 41.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.375, key: 42.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.376, key: 43.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.5, key: 44.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.624, key: 45.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.625, key: 46.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.626, key: 47.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.75, key: 48.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.874, key: 49.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.875, key: 50.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 0.876, key: 51.000 }))
      store.dispatch(phraseCreateNote({ trackID, start: 1, key: 52.000 }))

      for(let i = 0; i < store.getState().phrase.present.notes.length; i++)
        store.dispatch(phraseSelectNote({ noteID: i, loopIteration: 0, union: false}))

      store.dispatch(phraseQuantizeSelection())

      let noteStarts = store.getState().phrase.present.notes.map((note) => { return note.start })
      expect(noteStarts).to.equal([
        0, 0,
        0.25, 0.25, 0.25, 0.25,
        0.5, 0.5, 0.5, 0.5,
        0.75, 0.75, 0.75, 0.75,
        1, 1, 1
      ])
    })
  })
})
