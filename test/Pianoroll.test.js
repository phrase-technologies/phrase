import expect from 'expect';

import pianoroll from '../src/reducers/reducePianoroll.js';
import allTrackNotesSelector from '../src/selectors/selectorPianoroll.js';
import { pianorollCreateNote } from '../src/actions/actionsPianoroll.js';

describe("Pianoroll", () => {

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

    var actionBar1        = pianorollCreateNote( 36, 0.00 );
    var actionBar1Higher  = pianorollCreateNote( 48, 0.00 );
    var actionBar2        = pianorollCreateNote( 36, 1.00 );
    var actionBar3End     = pianorollCreateNote( 36, 2.75 );

    it("should always add the note", () => {
      // Many different permutations
      [actionBar1, actionBar1Higher, actionBar2, actionBar3End].forEach((action) => {
        [stateEmpty, stateSingleClip, stateMultipleClips].forEach((state) => {
          let newState = pianoroll( stateEmpty, action );
          var allNotes = newState.clips.reduce((allNotes,currentNotes) => allNotes.concat(currentNotes), []);
          expect( allNotes.length ).toBeGreaterThan( 0 );
        });
      });
    });

    it("should create a new clip if no existing clips", () => {
      // No clips at all to start with
      [actionBar1, actionBar1Higher, actionBar2, actionBar3End].forEach((action) => {
        let newState = pianoroll( stateEmpty, action );
        expect( newState.clips.length ).toEqual( 1 );
      });
    });

    it("should create a new clip if existing clip doesn't fit", () => {
      // 1 existing clip to start with, which doesn't fit the new note
      [actionBar2, actionBar3End].forEach((action) => {
        let newState = pianoroll( stateSingleClip, action );
        expect( newState.clips.length ).toEqual( 2 );
      });
    });

  });

});