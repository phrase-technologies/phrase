import expect from 'expect';
import u from 'updeep';
import { uIncrement, uAppend, uReplace } from '../src/helpers/arrayHelpers.js'

import reducePhrase, { defaultState } from '../src/reducers/reducePhrase.js';
import { phraseCreateClip,
         phraseCreateNote } from '../src/actions/actionsPhrase.js';

describe("Phrase", () => {

  var clip1             = { id: 0, start: 0.00, end: 1.00, offset: 0.00, loopLength: 1.00, notes: [] };
  var clip2half         = { id: 1, start: 1.00, end: 2.50, offset: 0.00, loopLength: 2.50, notes: [] };
  var clip3half         = { id: 2, start: 2.75, end: 3.50, offset: 0.50, loopLength: 1.00, notes: [] };

  var stateEmpty          = defaultState
  var stateSingleClip     = u.updateIn(['tracks', 0, 'clips'], [clip1], defaultState)
  var stateMultipleClips  = u.updateIn(['tracks', 0, 'clips'], [clip1, clip2half, clip3half], defaultState)

  var createClip1        = phraseCreateClip( 0, 0.00 )
  var createClip2        = phraseCreateClip( 0, 1.50 )
  var createClip3        = phraseCreateClip( 0, 2.97 )
  var createNote1        = phraseCreateNote( 0, 36.000, 0.00 )
  var createNote1Again   = phraseCreateNote( 0, 36.518, 0.00 )
  var createNote1Higher  = phraseCreateNote( 0, 48.000, 0.00 )
  var createNote2        = phraseCreateNote( 0, 36.000, 1.00 )
  var createNote3End     = phraseCreateNote( 0, 36.000, 2.75 )

  describe("Create New Clip", () => {

    it("should create a new clip if no existing clips", () => {
      // No clips at all to start with
      [createNote1, createNote1Again, createNote1Higher, createNote2, createNote3End].forEach((action) => {
        let newState = reducePhrase( stateEmpty, action );
        expect( newState.tracks[0].clips.length ).toEqual( 1 );
      });
    });

    it("should create a new clip if existing clip doesn't fit", () => {
      // 1 existing clip to start with, which doesn't fit the new note
      [createNote2, createNote3End].forEach((action) => {
        let newState = reducePhrase( stateSingleClip, action );
        expect( newState.tracks[0].clips.length ).toEqual( 2 );
      });
    });

    it("should never create two clips in the same place", () => {
      // Many different permutations
      var state = stateEmpty
      var priorClipCount = 0
      var currentClipCount = 0
      var actions = [createClip1, createClip2, createClip3]
      actions.forEach((action) => {
        // Create a new note first
        state = reducePhrase( state, action )
        currentClipCount = state.tracks[0].clips.length
        expect(currentClipCount).toEqual(priorClipCount + 1)
        priorClipCount = currentClipCount

        // Try creating the same note
        state = reducePhrase( state, action )
        currentClipCount = state.tracks[0].clips.length
        expect(currentClipCount).toEqual(priorClipCount)
        priorClipCount = currentClipCount
      })
    });

  })

  describe("Create New Note", () => {

    it("should always create the note", () => {
      // Many different permutations
      [createNote1, createNote1Again, createNote1Higher, createNote2, createNote3End].forEach((action) => {
        [stateEmpty, stateSingleClip, stateMultipleClips].forEach((state) => {
          let newState = reducePhrase( state, action );
          var allNotes = newState.tracks[0].clips.reduce((allNotes, clip) => allNotes.concat(clip.notes), [])
          expect( allNotes.length ).toBeGreaterThan( 0 );
        });
      });
    });

    it("should never create the same note twice", () => {
      // Many different permutations
      var state = stateEmpty
      var priorNoteCount = 0
      var currentNoteCount = 0
      var actions = [createNote1, createNote1Higher, createNote2, createNote3End]
      actions.forEach((action) => {
        // Create a new note first
        state = reducePhrase( state, action )
        currentNoteCount = state.tracks[0].clips.reduce((noteCount,clip) => noteCount += clip.notes.length, 0)
        expect(currentNoteCount).toEqual(priorNoteCount + 1)
        priorNoteCount = currentNoteCount

        // Try creating the same note
        state = reducePhrase( state, action )
        currentNoteCount = state.tracks[0].clips.reduce((noteCount,clip) => noteCount += clip.notes.length, 0)
        expect(currentNoteCount).toEqual(priorNoteCount)
        priorNoteCount = currentNoteCount
      })
    })

  });

});