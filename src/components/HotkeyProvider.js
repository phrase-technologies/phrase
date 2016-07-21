import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ActionCreators as UndoActions } from 'redux-undo'

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

import { phraseDeleteSelection } from 'reducers/reducePhrase'

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
    let { dispatch, show: modalShowing } = this.props

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
    let note = this.getNoteFromKeyCode(e.keyCode)
    if (!e.metaKey && !e.ctrlKey && note) {
      this.props.ENGINE.fireNote({ trackID: 0, keyNum: note, velocity: 127 })
      e.preventDefault()
      return
    }

    switch(e.keyCode) {
      // ----------------------------------------------------------------------
      // Undo History
      case 90:  // CTRL/CMD+Z - Undo last action
        if (e.metaKey && e.shiftKey) {
          dispatch(UndoActions.redo())
          e.preventDefault()
        } else if (e.metaKey) {
          dispatch(UndoActions.undo())
          e.preventDefault()
        }
        break
      case 89:  // CTRL/CMD+Y - Redo last action
        if (e.metaKey) {
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
      case 52:  // 4 - Slice tool
        dispatch(arrangeToolSelect(`scissors`))
        break
      case 53:  // 5 - Velocity tool
        dispatch(arrangeToolSelect(`velocity`))
        break
      // ----------------------------------------------------------------------
      // Layout
      case 9:   // Tab - toggle arrange / rack view
        dispatch({ type: layout.TOGGLE_RACK })
        e.preventDefault()
        break
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

    this.props.ENGINE.killNote({ trackID: 0, keyNum: this.getNoteFromKeyCode(e.keyCode) })
  }

  getNoteFromKeyCode(keyCode) {
    switch(keyCode) {
      case 65: return 48  // A - Key C of current octave
      case 83: return 50  // S - Key D of current octave
      case 68: return 52  // D - Key E of current octave
      case 70: return 53  // F - Key F of current octave
      case 71: return 55  // G - Key G of current octave
      case 72: return 57  // H - Key A of current octave
      case 74: return 59  // J - Key B of current octave
      case 75: return 60  // K - Key C of next octave
      case 76: return 62  // L - Key D of next octave
      case 186:
      case 59: return 64  // ; - Key E of next octave
      case 222:return 65  // ' - Key F of next octave
      case 87: return 49  // W - Key C# of current octave
      case 69: return 51  // E - Key D# of current octave
      case 84: return 54  // T - Key F# of current octave
      case 89: return 56  // Y - Key G# of current octave
      case 85: return 58  // U - Key A# of current octave
      case 79: return 61  // O - Key C# of current octave
      case 80: return 63  // P - Key D# of current octave
      default: return null
    }
  }

}

HotkeyProvider.contextTypes = {
  router: React.PropTypes.object.isRequired
}

HotkeyProvider.propTypes = {
  dispatch: React.PropTypes.func.isRequired
}

export default connectEngine(connect(state => state.modal)(HotkeyProvider))
