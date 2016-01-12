import expect from 'expect';

import pianoRoll,
       { findClipForNewNote } from '../src/reducers/reducerPianoRoll.js';
import allTrackNotesSelector from '../src/selectors/selectorPianoRoll.js';
import { pianoRollNewNote } from '../src/actions/actions.js';

describe("PianoRoll", () => {

  describe("Add New Note", () => {

    var barCount = 4;

    var noteBar1        = { keyNum: 36, start: 0.00, end: 0.25 };
    var noteBar1Higher  = { keyNum: 48, start: 0.00, end: 0.25 };
    var noteBar2        = { keyNum: 36, start: 1.00, end: 2.00 };
    var noteBar3End     = { keyNum: 36, start: 2.75, end: 3.00 };

    var clip1             = { start: 0.00, end: 1.00, offset: 0.00, loopLength: 1.00, notes: [] };
    var clip2half         = { start: 1.00, end: 2.50, offset: 0.00, loopLength: 2.50, notes: [] };
    var clip3half         = { start: 2.75, end: 3.50, offset: 0.50, loopLength: 1.00, notes: [] };

    var stateEmpty          = { noteLengthLast: 0.25, clips: [] };
    var stateSingleClip     = { noteLengthLast: 0.25, clips: [clip1] };
    var stateMultipleClips  = { noteLengthLast: 0.25, clips: [clip1, clip2half, clip3half] };

    var actionBar1        = pianoRollNewNote( 36, 0.00 );
    var actionBar1Higher  = pianoRollNewNote( 48, 0.00 );
    var actionBar2        = pianoRollNewNote( 36, 1.00 );
    var actionBar3End     = pianoRollNewNote( 36, 2.75 );

    it("should always add the note", () => {
      // Many different permutations
      [actionBar1, actionBar1Higher, actionBar2, actionBar3End].forEach((action) => {
        [stateEmpty, stateSingleClip, stateMultipleClips].forEach((state) => {
          let newState = pianoRoll( stateEmpty, action );
          var allNotes = newState.clips.reduce((allNotes,currentNotes) => allNotes.concat(currentNotes), []);
          expect( allNotes.length ).toBeGreaterThan( 0 );
        });
      });
    });

    it("should create a new clip if no existing clips", () => {
      // No clips at all to start with
      [actionBar1, actionBar1Higher, actionBar2, actionBar3End].forEach((action) => {
        let newState = pianoRoll( stateEmpty, action );
        expect( newState.clips.length ).toEqual( 1 );
      });
    });

    it("should create a new clip if existing clip doesn't fit", () => {
      // 1 existing clip to start with, which doesn't fit the new note
      [actionBar2, actionBar3End].forEach((action) => {
        let newState = pianoRoll( stateSingleClip, action );
        expect( newState.clips.length ).toEqual( 2 );
      });
    });

  });

});