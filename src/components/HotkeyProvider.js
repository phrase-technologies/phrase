import { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { ActionCreators as UndoActions } from 'redux-undo'

import { isModifierOn } from 'helpers/compatibilityHelpers'

import {
  midiIncrementOctave,
  midiDecrementOctave,
} from 'reducers/reduceMIDI'
import { modalClose } from 'reducers/reduceModal'
import connectEngine from '../audio/AudioEngineConnect.js'
import {
  transportRecord,
  transportPlayToggle,
  transportStop,
  transportRewindPlayhead,
  transportAdvancePlayhead,
  transportCountIn,
  transportMetronome,
} from 'reducers/reduceTransport'

import {
  phraseDeleteSelection,
  phraseQuantizeSelection,
  phraseSelectAll,
} from 'reducers/reducePhrase'

import { arrangeToolSelect } from 'reducers/reduceArrangeTool'

// ============================================================================
// Hotkey Provider
// ============================================================================
// Special provider component which you should wrap your entire app with.
// Provides global hotkey handling (keyboard shortcuts)
//
// Unsure of whether or not this will conflict with forms...
class HotkeyProvider extends Component {

  render() {
    return this.props.children
  }

  constructor() {
    super()
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
  }

  handleKeyDown = (e) => {
    let { dispatch, show: modalShowing, ENGINE } = this.props

    if (modalShowing) {
      if (e.keyCode === 27) { // 'escape' - close modals
        return dispatch(modalClose())
      }
    }

    // -----------------------------------------------------------------------
    // Bypass - Prevent doublebooking events with form <inputs>
    if (e.target.tagName === 'INPUT') {
      return
    }
    if (e.target.tagName === 'SELECT')
      return
    if (e.target.tagName === 'TEXTAREA')
      return
    if (e.target.tagName === 'A')
      return
    if (e.target.tagName === 'BUTTON')
      return

    // -----------------------------------------------------------------------
    // Overrides

    // ----------------------------------------------------------------------
    // Musical Typing
    // ----------------------------------------------------------------------
    // Musical Typing Settings (do this before to avoid conflicts with CMD+Z for undo)
    switch(e.keyCode) {
      case 16: // shift - sustain on
        ENGINE.sendMidiEvent({ trackID: 0, key: 0, type: 176, velocity: 127 })
        break
      case 90:   // Z - decrement current octave
        dispatch(midiDecrementOctave())
        break
      case 88:   // X - increment current octave
        dispatch(midiIncrementOctave())
        break
    }
    let note = this.getNoteFromKeyCode(e.keyCode)
    if (!e.metaKey && !e.ctrlKey && note) {
      ENGINE.fireNote({ trackID: 0, keyNum: note, velocity: 127 })
      e.preventDefault()
      return
    }

    switch(e.keyCode) {
      // ----------------------------------------------------------------------
      // Undo History
      case 90:  // CTRL/CMD+Z - Undo last action
        if (isModifierOn(e) && e.shiftKey) {
          dispatch(UndoActions.redo())
          e.preventDefault()
        } else if (isModifierOn(e)) {
          dispatch(UndoActions.undo())
          e.preventDefault()
        }
        break
      case 89:  // CTRL/CMD+Y - Redo last action
        if (isModifierOn(e)) {
          dispatch(UndoActions.redo())
          e.preventDefault()
        }
        break
      // ----------------------------------------------------------------------
      // Transport Controls
      case 82:  // R - Record
        dispatch(transportRecord())
        break
      case 32:  // Space - Toggle Playback
        dispatch(transportPlayToggle())
        e.preventDefault()
        break
      case 13:  // Enter - Stop Playback or Return to beginning
        dispatch(transportStop())
        e.preventDefault()
        break
      case 188: // < - Rewind Playhead
        dispatch(transportRewindPlayhead())
        break
      case 190: // > - Advance Playhead
        dispatch(transportAdvancePlayhead())
        break
      case 77:  // 'M' - Metronome / Count In
        if (e.shiftKey)
          dispatch(transportCountIn())
        else
          dispatch(transportMetronome())
        e.preventDefault()
        break
      // ----------------------------------------------------------------------
      // Editing
      case 8:   // Backspace - Delete Selection
      case 46:  // Delete
        dispatch(phraseDeleteSelection())
        e.preventDefault()
        break
      case 81: // Quantize
        dispatch(phraseQuantizeSelection())
        e.preventDefault()
        break
      case 65: // Select all
        if (isModifierOn(e)) {
          dispatch(phraseSelectAll())
          e.preventDefault()
        }
        break
      // ----------------------------------------------------------------------
      // Mouse Tools
      case 49:  // 1 - Default tool
        dispatch(arrangeToolSelect(`pointer`))
        break
      case 50:  // 2 - Pencil tool
        dispatch(arrangeToolSelect(`pencil`))
        break
      case 51:  // 3 - Eraser tool
        dispatch(arrangeToolSelect(`eraser`))
        break
      // TEMPORARILY DISABLE UNTIL WE FIX SLICE (TODO)
      // case 52:  // 4 - Slice tool
      //   dispatch(arrangeToolSelect(`scissors`))
      //   break
      // case 53:  // 5 - Velocity tool // TEMPORARILY CHANGE from 5 to 4 UNTIL WE FIX SLICE (TODO)
      case 52:  // 4 - Velocity tool
        dispatch(arrangeToolSelect(`velocity`))
        break
      // ----------------------------------------------------------------------
      // Layout
      /* // TEMPORARILY DISABLE UNTIL WE LAUNCH RACKS (TODO)
      case 9:   // Tab - toggle arrange / rack view
        dispatch({ type: layout.TOGGLE_RACK })
        e.preventDefault()
        break
      */
    }
  }

  handleKeyUp = (e) => {
    // -----------------------------------------------------------------------
    // Bypass - Prevent doublebooking events with form <inputs>
    if (e.target.tagName === 'INPUT')
      return
    if (e.target.tagName === 'SELECT')
      return
    if (e.target.tagName === 'TEXTAREA')
      return
    if (e.target.tagName === 'A')
      return
    if (e.target.tagName === 'BUTTON')
      return

    switch(e.keyCode) {
      case 16: // shift - sustain off
        this.props. ENGINE.sendMidiEvent({ trackID: 0, key: 0, type: 176, velocity: 0 })
        break
    }

    let keyNum = this.getNoteFromKeyCode(e.keyCode)
    if (Number.isInteger(keyNum))
      this.props.ENGINE.killNote({ trackID: 0, keyNum })
  }

  getNoteFromKeyCode(keyCode) {
    let note = 12 * this.props.currentOctave
    switch(keyCode) {
      case 65: note +=  0; break  // A - Key C of current octave
      case 83: note +=  2; break  // S - Key D of current octave
      case 68: note +=  4; break  // D - Key E of current octave
      case 70: note +=  5; break  // F - Key F of current octave
      case 71: note +=  7; break  // G - Key G of current octave
      case 72: note +=  9; break  // H - Key A of current octave
      case 74: note += 11; break  // J - Key B of current octave
      case 75: note += 12; break  // K - Key C of next octave
      case 76: note += 14; break  // L - Key D of next octave
      case 186:
      case 59: note += 16; break  // ; - Key E of next octave
      case 222:note += 17; break  // ' - Key F of next octave
      case 87: note +=  1; break  // W - Key C# of current octave
      case 69: note +=  3; break  // E - Key D# of current octave
      case 84: note +=  6; break  // T - Key F# of current octave
      case 89: note +=  8; break  // Y - Key G# of current octave
      case 85: note += 10; break  // U - Key A# of current octave
      case 79: note += 13; break  // O - Key C# of current octave
      case 80: note += 15; break  // P - Key D# of current octave
      default: return null
    }
    return note
  }

}

function mapStateToProps(state) {
  return {
    ...state.modal,
    currentOctave: state.midi.currentOctave,
  }
}

export default withRouter(connectEngine(connect(mapStateToProps)(HotkeyProvider)))
