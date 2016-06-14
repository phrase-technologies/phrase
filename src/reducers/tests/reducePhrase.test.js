import { createStore, compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { expect } from 'chai'

import {
  phraseCreateClip,
  phraseCreateNote,
  phraseSliceClip,
} from 'reducers/reducePhrase'

import { testReducer } from 'reducers/reduce'

let finalCreateStore = compose(applyMiddleware(thunk))(createStore)

describe('Phrase', () => {

  let store

  beforeEach(() => store = finalCreateStore(testReducer))

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
      let notes = [ 5, 5.25, 5.5, 5.75 ]

      store.dispatch(phraseCreateClip(trackID, 5))

      notes.forEach(x => store.dispatch(phraseCreateNote(trackID, x)))

      let foundClip = store.getState().phrase.present.clips[0]
      store.dispatch(phraseSliceClip({ trackID: 0, bar: 5.5, foundClip }))

      expect(store.getState().phrase.present.notes).to.have.lengthOf(4)
      expect(store.getState().phrase.present.notes.filter(x => x.clipID === 1)).to.have.lengthOf(2)
      expect(store.getState().phrase.present.notes.filter(x => x.clipID === 2)).to.have.lengthOf(2)
    })

    it(`should work correctly at bar 0`, () => {
      let trackID = 0
      let notes = [ 0, .25, .5, .75 ]

      store.dispatch(phraseCreateClip(trackID, 0))

      notes.forEach(x => store.dispatch(phraseCreateNote(trackID, x)))

      let foundClip = store.getState().phrase.present.clips[0]
      store.dispatch(phraseSliceClip({ trackID: 0, bar: 0.5, foundClip }))

      expect(store.getState().phrase.present.notes).to.have.lengthOf(4)
      expect(store.getState().phrase.present.notes.filter(x => x.clipID === 1)).to.have.lengthOf(2)
      expect(store.getState().phrase.present.notes.filter(x => x.clipID === 2)).to.have.lengthOf(2)
    })

    it(`should only put one item on the undo stack`, () => {
      let trackID = 0
      let notes = [ 0, .25, .5, .75 ]

      store.dispatch(phraseCreateClip(trackID, 0))

      notes.forEach(x => store.dispatch(phraseCreateNote(trackID, x)))

      expect(store.getState().phrase.past).to.have.lengthOf(5)

      let foundClip = store.getState().phrase.present.clips[0]
      store.dispatch(phraseSliceClip({ trackID: 0, bar: 0.5, foundClip }))

      expect(store.getState().phrase.past).to.have.lengthOf(6)
    })
  })

})
