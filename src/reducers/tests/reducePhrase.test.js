import { createStore, compose, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import undoable, { excludeAction } from 'redux-undo'
import { expect } from 'chai'

import reducePhrase, {
  phraseCreateClip,
  phraseCreateNote,
  phraseSliceClip,
} from '../reducePhrase'

import reducePhraseMeta from '../reducePhraseMeta'
import reducePianoroll from '../reducePianoroll'

import { phrase } from 'actions/actions'

let finalReducer = combineReducers({
  phrase: undoable(reducePhrase, { filter: excludeAction(phrase.LOAD) }),
  phraseMeta: reducePhraseMeta,
  pianoroll: reducePianoroll,
})

let finalCreateStore = compose(applyMiddleware(thunk))(createStore)

describe('Phrase', () => {

  let store

  beforeEach(() => store = finalCreateStore(finalReducer))

  describe(`Create Note`, () => {
    it(`should create a new clip if no existing clips`, () => {
      expect(store.getState().phrase.present.clips).to.have.lengthOf(0)
      store.dispatch(phraseCreateNote(0, 36.000, 0.00))
      expect(store.getState().phrase.present.clips).to.have.lengthOf(1)
    })
  })

  describe(`Create Clip`, () => {
    it(`should create a clip`, () => {
      expect(store.getState().phrase.present.clips).to.have.lengthOf(0)
      store.dispatch(phraseCreateClip())
      expect(store.getState().phrase.present.clips).to.have.lengthOf(1)
    })
  })

  describe(`Slice Clip`, () => {
    it(`should remove the target clip and create two new ones`, () => {
      store.dispatch(phraseCreateClip(0, 0))
      let foundClip = store.getState().phrase.present.clips[0]
      store.dispatch(phraseSliceClip({ trackID: 0, bar: 0.5, foundClip }))
      expect(store.getState().phrase.present.clips.find(x => x.id === 0)).to.be.undefined
      expect(store.getState().phrase.present.clips).to.have.lengthOf(2)
    })

    it(`should copy notes from original clip to the new ones`, () => {
      let trackID = 0

      store.dispatch(phraseCreateClip(trackID, 5))

      store.dispatch(phraseCreateNote(trackID, 5))
      store.dispatch(phraseCreateNote(trackID, 5.25))
      store.dispatch(phraseCreateNote(trackID, 5.5))
      store.dispatch(phraseCreateNote(trackID, 5.75))

      let foundClip = store.getState().phrase.present.clips[0]
      store.dispatch(phraseSliceClip({ trackID: 0, bar: 5.5, foundClip }))

      expect(store.getState().phrase.present.notes).to.have.lengthOf(4)
      expect(store.getState().phrase.present.notes.filter(x => x.clipID === 1)).to.have.lengthOf(2)
      expect(store.getState().phrase.present.notes.filter(x => x.clipID === 2)).to.have.lengthOf(2)
    })

    it(`should work correctly at bar 0`, () => {
      let trackID = 0

      store.dispatch(phraseCreateClip(trackID, 0))

      store.dispatch(phraseCreateNote(trackID, 0))
      store.dispatch(phraseCreateNote(trackID, 0.25))
      store.dispatch(phraseCreateNote(trackID, 0.5))
      store.dispatch(phraseCreateNote(trackID, 0.75))

      let foundClip = store.getState().phrase.present.clips[0]
      store.dispatch(phraseSliceClip({ trackID: 0, bar: 0.5, foundClip }))

      expect(store.getState().phrase.present.notes).to.have.lengthOf(4)
      expect(store.getState().phrase.present.notes.filter(x => x.clipID === 1)).to.have.lengthOf(2)
      expect(store.getState().phrase.present.notes.filter(x => x.clipID === 2)).to.have.lengthOf(2)
    })
  })

})
