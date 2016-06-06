/*
import expect from 'expect'
import u from 'updeep'
import { uAppend } from '../../helpers/arrayHelpers.js'

import _ from 'lodash'
import reducePhrase,
       { defaultState,
         phraseCreateClip,
         phraseCreateNote
       } from '../reducePhrase.js'

describe('Phrase', () => {

  let clip1             = { id: 0, trackID: 0, start: 0.00, end: 1.00, offset: 0.00, loopLength: 1.00, notes: [] }
  let clip2half         = { id: 1, trackID: 0, start: 1.00, end: 2.50, offset: 0.00, loopLength: 2.50, notes: [] }
  let clip3half         = { id: 2, trackID: 0, start: 2.75, end: 3.50, offset: 0.50, loopLength: 1.00, notes: [] }

  let stateEmpty          = defaultState
  let stateSingleClip     = u({clips: uAppend(clip1)}, defaultState)
  let stateMultipleClips  = u({clips: _.flow(uAppend(clip1), uAppend(clip3half))}, defaultState)

  let createClip1        = phraseCreateClip(0, 0.00)
  let createClip2        = phraseCreateClip(0, 1.50)
  let createClip3        = phraseCreateClip(0, 2.97)
  let createNote1        = phraseCreateNote(0, 36.000, 0.00)
  let createNote1Again   = phraseCreateNote(0, 36.518, 0.00)
  let createNote1Higher  = phraseCreateNote(0, 48.000, 0.00)
  let createNote2        = phraseCreateNote(0, 36.000, 1.00)
  let createNote3End     = phraseCreateNote(0, 36.000, 2.75)

  describe('Create New Clip', () => {

    it('should create a new clip if no existing clips', () => {
      // No clips at all to start with
      [createNote1, createNote1Again, createNote1Higher, createNote2, createNote3End].forEach((action) => {
        let newState = reducePhrase(stateEmpty, action)
        expect(newState.clips.length).toEqual(1)
      })
    })

    it('should create a new clip if existing clip doesn\'t fit', () => {
      // 1 existing clip to start with, which doesn't fit the new note
      [createNote2, createNote3End].forEach((action) => {
        let newState = reducePhrase(stateSingleClip, action)
        expect(newState.clips.length).toEqual(2)
      })
    })

    it('should never create two clips in the same place', () => {
      // Many different permutations
      let state = stateEmpty
      let priorClipCount = 0
      let currentClipCount = 0
      let actions = [createClip1, createClip2, createClip3]
      actions.forEach((action) => {
        // Create a new note first
        state = reducePhrase(state, action)
        currentClipCount = state.clips.length
        expect(currentClipCount).toEqual(priorClipCount + 1)
        priorClipCount = currentClipCount

        // Try creating the same note
        state = reducePhrase(state, action)
        currentClipCount = state.clips.length
        expect(currentClipCount).toEqual(priorClipCount)
        priorClipCount = currentClipCount
      })
    })

  })

  describe('Create New Note', () => {

    it('should always create the note', () => {
      // Many different permutations into existing empty clips with no notes
      [createNote1, createNote1Again, createNote1Higher, createNote2, createNote3End].forEach((action) => {
        [stateEmpty, stateSingleClip, stateMultipleClips].forEach((state) => {
          let newState = reducePhrase(state, action)
          expect(newState.notes.length).toBeGreaterThan(0)
        })
      })
    })

    it('should never create the same note twice', () => {
      // Many different permutations into empty tracks with no clips or notes
      let state = stateEmpty
      let priorNoteCount = 0
      let currentNoteCount = 0
      let actions = [createNote1, createNote1Higher, createNote2, createNote3End]
      actions.forEach((action) => {
        // Create a new note first
        state = reducePhrase(state, action)
        currentNoteCount = state.notes.length
        expect(currentNoteCount).toEqual(priorNoteCount + 1)
        priorNoteCount = currentNoteCount

        // Try creating the same note
        state = reducePhrase(state, action)
        currentNoteCount = state.notes.length
        expect(currentNoteCount).toEqual(priorNoteCount)
        priorNoteCount = currentNoteCount
      })
    })

  })

})
*/
