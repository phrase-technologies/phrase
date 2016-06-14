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
    it(`should use existing clip if in the correct location`, () => {
      let trackID = 0

      store.dispatch(phraseCreateClip(trackID, 0.5))
      expect(store.getState().phrase.present.clips).to.have.lengthOf(1)
      store.dispatch(phraseCreateNote(trackID, 0.50, 36.000))
      expect(store.getState().phrase.present.clips).to.have.lengthOf(1)
    })

    it(`should create a new clip if no existing clips`, () => {
      let trackID = 0

      expect(store.getState().phrase.present.clips).to.have.lengthOf(0)
      store.dispatch(phraseCreateNote(trackID, 0.5, 36.000))
      expect(store.getState().phrase.present.clips).to.have.lengthOf(1)
      store.dispatch(phraseCreateNote(trackID, 1.5, 36.000))
      expect(store.getState().phrase.present.clips).to.have.lengthOf(2)
    })

    it(`should snap newly created clips to fill the closest bar`, () => {
      let trackID = 0

      store.dispatch(phraseCreateNote(trackID, 0.50, 36.000))
      let newClip = store.getState().phrase.present.clips[0]
      expect(newClip.start).to.equal(0.0)
      expect(newClip.end).to.equal(1.0)
    })
  })

  describe(`Create Clip`, () => {
    it(`should create a clip if no existing clips`, () => {
      expect(store.getState().phrase.present.clips).to.have.lengthOf(0)
      store.dispatch(phraseCreateClip())
      expect(store.getState().phrase.present.clips).to.have.lengthOf(1)
    })

    it(`should never create two clips in the same bar`, () => {
      let trackID = 0

      // Setup first clip
      expect(store.getState().phrase.present.clips).to.have.lengthOf(0)
      store.dispatch(phraseCreateClip(trackID, 0.5))
      expect(store.getState().phrase.present.clips).to.have.lengthOf(1)

      // Try to create 3 more clips in the same bar as the existing one, none should make it through
      store.dispatch(phraseCreateClip(trackID, 0.5))
      store.dispatch(phraseCreateClip(trackID, 0.75))
      store.dispatch(phraseCreateClip(trackID, 0.0))
      expect(store.getState().phrase.present.clips).to.have.lengthOf(1)

      // Create a clip directly at the boundary - bars are lower limit inclusive, upper limit exclusive!
      store.dispatch(phraseCreateClip(trackID, 1.0))
      expect(store.getState().phrase.present.clips).to.have.lengthOf(2)

      // Try to create 2 more clips in a different track, only 1 should make it through.
      trackID = 1
      store.dispatch(phraseCreateClip(trackID, 2.5))
      store.dispatch(phraseCreateClip(trackID, 2.5))
      expect(store.getState().phrase.present.clips).to.have.lengthOf(3)
    })

    it(`should snap newly created clips to fill the closest bar`, () => {
      let trackID = 0

      store.dispatch(phraseCreateClip(trackID, 0.5))
      expect(store.getState().phrase.present.clips[0].start).to.equal(0.0)
      expect(store.getState().phrase.present.clips[0].end).to.equal(1.0)
    })
  })

  describe(`Slice Clip`, () => {
    it(`should remove the target clip and create two new ones`, () => {
      let trackID = 0

      store.dispatch(phraseCreateClip(trackID, 0))
      let foundClip = store.getState().phrase.present.clips[0]
      store.dispatch(phraseSliceClip({ trackID, bar: 0.5, foundClip }))
      expect(store.getState().phrase.present.clips.find(x => x.id === 0)).to.be.undefined
      expect(store.getState().phrase.present.clips).to.have.lengthOf(2)
    })

    it(`should copy notes from original clip to the new ones`, () => {
      let trackID = 0
      let notes = [ 5, 5.25, 5.5, 5.75 ]

      store.dispatch(phraseCreateClip(trackID, 5))

      notes.forEach(x => store.dispatch(phraseCreateNote(trackID, x)))

      let foundClip = store.getState().phrase.present.clips[0]
      store.dispatch(phraseSliceClip({ trackID, bar: 5.5, foundClip }))

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
      store.dispatch(phraseSliceClip({ trackID, bar: 0.5, foundClip }))

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
      store.dispatch(phraseSliceClip({ trackID, bar: 0.5, foundClip }))

      expect(store.getState().phrase.past).to.have.lengthOf(6)
    })

    it(`should not modify the version moved to the undo stack`, () => {
      let trackID = 0
      let notes = [ 0, .25, .5, .75 ]

      store.dispatch(phraseCreateClip(trackID, 0))
      notes.forEach(x => store.dispatch(phraseCreateNote(trackID, x)))
      let phraseStateBeforeSlice = store.getState().phrase.present

      let foundClip = store.getState().phrase.present.clips[0]
      store.dispatch(phraseSliceClip({ trackID, bar: 0.5, foundClip }))

      expect(store.getState().phrase.past[6-1]).to.equal(phraseStateBeforeSlice)
    })

    it(`should round to nearest quarter by default`, () => {
      let trackID = 0

      store.dispatch(phraseCreateClip(trackID, 0))

      let foundClip = store.getState().phrase.present.clips[0]
      store.dispatch(phraseSliceClip({ trackID, bar: 0.45, foundClip }))

      expect(store.getState().phrase.present.clips[1].start).to.eq(0.5)
    })

    it(`should not create clips beyond the original clip boundaries (full-bar original clip length)`, () => {
      let trackID = 0

      store.dispatch(phraseCreateClip(trackID, 0))

      let foundClip = store.getState().phrase.present.clips[0]
      store.dispatch(phraseSliceClip({ trackID, bar: 0.9, foundClip }))

      expect(store.getState().phrase.present.clips.some(x => x.end > foundClip.end)).to.be.false
    })

    it(`should not create clips beyond the original clip boundaries (partial-bar original clip length)`, () => {
      let trackID = 0
      let snapStart = false

      store.dispatch(phraseCreateClip(trackID, 0.50, 0.25, snapStart))
      let foundClip = store.getState().phrase.present.clips[0]
      expect(foundClip.start).to.equal(0.50)
      expect(foundClip.end).to.equal(0.75)

      store.dispatch(phraseSliceClip({ trackID, bar: 0.60, foundClip }))

      expect(store.getState().phrase.present.clips.some(x => x.end > foundClip.end)).to.be.false
    })
  })

})
