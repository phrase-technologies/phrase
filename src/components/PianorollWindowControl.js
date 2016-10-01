import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'
import connectEngine from '../audio/AudioEngineConnect'
import engineShape   from '../audio/AudioEnginePropTypes'
import { isModifierOn } from 'helpers/compatibilityHelpers'

import _ from 'lodash'

import {
  pianorollScrollX,
  pianorollScrollY,
  pianorollResizeWidth,
  pianorollResizeHeight,
  pianorollMoveCursor,
  pianorollSelectionBoxStart,
  pianorollSelectionBoxResize,
  pianorollSelectionBoxApply
} from 'reducers/reducePianoroll'

import {
  phraseCreateNote,
  phraseSelectNote,
  phraseDeleteNote,
  phraseSliceNote,
  phraseDragNoteSelection,
  phraseDropNoteSelection,
  phraseDragNoteVelocity,
  phraseDropNoteVelocity,
} from 'reducers/reducePhrase'

import {
  cursorChange,
  cursorResizeLeft,
  cursorResizeRight,
  cursorClear
} from 'actions/actionsCursor'

import {
  commentSelectionStart,
  commentSelectionEnd,
} from 'reducers/reduceComment'

import { phrase, mouse } from 'actions/actions'

const SELECT_EMPTY_AREA = 'SELECT_EMPTY_AREA'
const CLICK_EMPTY_AREA = 'CLICK_EMPTY_AREA'
const SELECT_NOTE = 'SELECT_NOTE'
const CLICK_NOTE = 'CLICK_NOTE'
const DRAG_NOTE = 'DRAG_NOTE'
const CHANGE_NOTE_VELOCITY = 'CHANGE_NOTE_VELOCITY'
const SELECTION_BOX = 'SELECTION_BOX'
const COMMENT_GRIP = 'COMMENT_GRIP'
const DOUBLECLICK_DELAY = 360

export class PianorollWindowControl extends Component {

  render() {
    return (
      <div className="pianoroll-window-control">
        {this.props.children}
      </div>
    )
  }

  constructor() {
    super(...arguments)
    this.handleResize   = this.handleResize.bind(this)
    this.mouseDownEvent = this.mouseDownEvent.bind(this)
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this)
    this.mouseUpEvent   = this.mouseUpEvent.bind(this)
    this.lastKeysPlayed  = null
  }

  componentDidMount() {
    // Setup Grid System
    this.props.grid.marginTop    =  0
    this.props.grid.marginBottom =  0
    this.props.grid.marginLeft   = 10
    this.props.grid.marginRight  = 10
    this.props.grid.didMount()

    // Event Sources
    this.container = ReactDOM.findDOMNode(this)
    this.container.addEventListener('mousedown', this.mouseDownEvent)
    document.addEventListener('mousemove', this.mouseMoveEvent)
    document.addEventListener('mouseup',   this.mouseUpEvent)
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  }

  componentWillUnmount() {
    this.container.removeEventListener('mousedown', this.mouseDownEvent)
    document.removeEventListener('mousemove', this.mouseMoveEvent)
    document.removeEventListener('mouseup',   this.mouseUpEvent)
    window.removeEventListener('resize', this.handleResize)
  }

  mouseDownEvent(e) {
    // Ensure clicks from the scrollbars don't interfere
    if (e.target !== this.container)
      return

    switch(e.which) {
      default:
      case 1:
      case 2: this.leftClickEvent(e);  break
      case 3: this.rightClickEvent(e); break // TODO: handle right click
    }
  }

  leftClickEvent(e) {
    if (this.props.arrangeTool === "comment")
      return this.commentGripEvent(e)

    // Everything except comments requires edit permissions
    let editable = !this.props.existingPhrase || this.props.ownerOfPhrase
    if (!editable)
      return

    let bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount
    let key = (this.props.keyCount - (this.props.yMin + this.props.grid.getMouseYPercent(e)*this.props.grid.getKeyRange()) * this.props.keyCount + 8)
    let foundNote = this.getNoteAtBarKey(bar, key)

    if (foundNote) {
      this.noteEvent(e, bar, key, foundNote)
    } else {
      this.emptyAreaEvent(e, bar, key)
    }
  }

  noteEvent(e, bar, key, foundNote) {
    if (this.props.currentTrack.type === "AUDIO")
      return

    // Play the sound
    this.previewNoteSound([key], foundNote.velocity)

    // Second Click - Note
    if (this.lastEvent &&
        this.lastEvent.action === CLICK_NOTE &&
        this.props.arrangeTool === 'pointer') {
      // Double click - Delete Note
      if (Date.now() - this.lastEvent.time < DOUBLECLICK_DELAY) {
        this.props.dispatch(phraseDeleteNote(foundNote.id))
        this.lastEvent = null
        return
      }
      this.lastEvent = null
    }

    // First Click - Start Selection
    if (!this.lastEvent) {
      switch (this.props.arrangeTool) {
        case 'pointer':
        case 'velocity':
          this.lastEvent = {
            action: SELECT_NOTE,
            noteID: foundNote.id,
            bar,
            key,
            time: Date.now(),
          }
          let noteLength = foundNote.end - foundNote.start
          let threshold = Math.min(
            8*this.props.grid.pixelScale/this.props.grid.width*this.props.grid.getBarRange()*this.props.barCount,
            0.25*noteLength
          )

          if (!foundNote.selected || e.shiftKey) {
            this.props.dispatch(phraseSelectNote({
              noteID: foundNote.id,
              loopIteration: foundNote.loopIteration,
              union: e.shiftKey,
            }))
          } else if (foundNote.selected === "faded") {
            this.props.dispatch(phraseSelectNote({
              noteID: foundNote.id,
              loopIteration: foundNote.loopIteration,
              union: false,
            }))
          }

          if (bar < foundNote.start + threshold) {
            this.props.dispatch(cursorResizeLeft('explicit'))
            this.lastEvent.grip = 'MIN'
          } else if (bar > foundNote.end - threshold) {
            this.props.dispatch(cursorResizeRight('explicit'))
            this.lastEvent.grip = 'MAX'
          } else {
            this.props.dispatch(cursorClear('explicit'))
            this.lastEvent.grip = 'MID'
          }

          if (this.props.arrangeTool === `velocity`) {
            this.dragging = true
            e.target.requestPointerLock = e.target.requestPointerLock || e.target.mozRequestPointerLock
            if (e.target.requestPointerLock) {
              e.target.requestPointerLock()
            } else {
              this.pointerLockFallback = true
            }
          }

          break

        case 'scissors':
          this.props.dispatch(phraseSliceNote({
            bar,
            trackID: this.props.currentTrack.id,
            noteID: foundNote.id
          }))

          break

        case 'eraser':
          this.props.dispatch({ type: phrase.DELETE_NOTE, noteID: foundNote.id })
          break

        default:
          return
      }
    }
  }

  emptyAreaEvent(e, bar, key) {
    // Second Click - Empty Area
    if (this.lastEvent &&
        this.lastEvent.action === CLICK_EMPTY_AREA &&
        this.props.currentTrack.type !== "AUDIO") {
      // Double click - Create Note
      if (this.props.arrangeTool === `pointer` &&
        Date.now() - this.lastEvent.time < DOUBLECLICK_DELAY
      ) {
        this.props.dispatch(phraseCreateNote({
          trackID: this.props.currentTrack.id,
          start: bar,
          key,
        }))
        this.previewNoteSound([key])
        this.lastEvent = null
        return
      }
      this.lastEvent = null
    }

    // First Click - Start Selection
    if (!this.lastEvent) {
      switch(this.props.arrangeTool) {
        case `pencil`:
          if (this.props.currentTrack.type === "AUDIO")
            return
          this.previewNoteSound([Math.ceil(key)], 127)
          this.props.dispatch(phraseCreateNote({ trackID: this.props.currentTrack.id, start: bar, key }))
          break
        case `scissors`:
        case `eraser`:
          // Do nothing
          break
        case `velocity`:
        default:
          this.props.dispatch(pianorollSelectionBoxStart(bar, key))
          this.lastEvent = {
            action: SELECT_EMPTY_AREA,
            bar,
            key,
            time: Date.now()
          }
      }
    }
  }

  mouseMoveEvent(e) {
    let { dispatch, arrangeTool } = this.props

    let bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount
    let key = this.props.keyCount - (this.props.yMin + this.props.grid.getMouseYPercent(e)*this.props.grid.getKeyRange()) * this.props.keyCount + 8

    // Drag Selected Note(s)?
    if (this.lastEvent &&
       (this.lastEvent.action === SELECT_NOTE ||
        this.lastEvent.action === DRAG_NOTE ||
        this.lastEvent.action === COMMENT_GRIP ||
        this.lastEvent.action === CHANGE_NOTE_VELOCITY)) {

        switch (arrangeTool) {
          case `pointer`:
            // Adjust Note
            let offsetStart, offsetEnd, offsetKey
            let offsetBar = bar - this.lastEvent.bar

            switch (this.lastEvent.grip) {
              case 'MIN':
                offsetStart = offsetBar
                offsetEnd = 0
                offsetKey = 0
                break

              case 'MID':
                offsetStart = offsetBar
                offsetEnd = offsetBar
                offsetKey = key - this.lastEvent.key
                break

              case 'MAX':
                offsetStart = 0
                offsetEnd = offsetBar
                offsetKey = 0
                break
            }

            dispatch(phraseDragNoteSelection({
              grippedNoteID: this.lastEvent.noteID,
              targetBar: bar,
              offsetStart,
              offsetEnd,
              offsetKey,
              offsetSnap: !isModifierOn(e),
              offsetCopy: e.altKey,
            }))

            this.previewDragSound(offsetKey)
            this.lastEvent.action = DRAG_NOTE
            return

          case `velocity`:
            if (!this.pointerLockFallback) {
              let delta = e.movementY || e.mozMovementY || 0
              if (this.lastEvent.delta !== delta) {
                dispatch(phraseDragNoteVelocity({
                  noteID: this.lastEvent.noteID,
                  targetBar: bar,
                  delta
                }))
              }

              this.lastEvent.delta = delta
            } else {
              let note = this.props.notes.find(x => x.id === this.lastEvent.noteID)

              let transientNote = (this.lastEvent.transientNotes || []).find(x =>
                x.id === note.id
              )

              if (!transientNote) {
                this.lastEvent.transientNotes = [
                  ...(this.lastEvent.transientNotes || []),
                  note
                ]
              }

              let offsetY = this.props.mouse.y - this.props.mouse.downY

              let nextVelocity = transientNote
                ? transientNote.velocity - offsetY
                : note.velocity - offsetY

              dispatch(phraseDragNoteVelocity({
                noteID: this.lastEvent.noteID,
                targetBar: bar,
                nextVelocity
              }))
            }

            this.lastEvent.action = CHANGE_NOTE_VELOCITY
            return

          case 'comment':
            return this.commentDragEvent(e)
        }
    }

    // Selection Box?
    if (this.lastEvent &&
       (this.lastEvent.action === SELECT_EMPTY_AREA ||
        this.lastEvent.action === SELECTION_BOX)) {
      // Resize Selection Box
      dispatch(pianorollSelectionBoxResize(bar, key))
      this.lastEvent.action = SELECTION_BOX
      return
    }

    // No Action - Clear the queue
    this.lastEvent = null

    // Cursor on hover over notes
    this.hoverEvent(e, bar, key)
  }

  hoverEvent(e, bar, key) {
    if (e.target !== this.container)
      return

    let foundNote = this.getNoteAtBarKey(bar, key)
    if (foundNote) {
      let noteLength = foundNote.end - foundNote.start
      let threshold = Math.min(
        8*this.props.grid.pixelScale/this.props.grid.width*this.props.grid.getBarRange()*this.props.barCount,
        0.25*noteLength
      )

      if (this.props.arrangeTool !== "pointer") {
        if (this.props.arrangeTool === `velocity`) {
          this.props.dispatch({
            type: mouse.TOGGLE_TOOLTIP,
            payload: {
              text: `Velocity: ${foundNote.velocity}`
            }
          })
        }
        this.props.dispatch(cursorChange({
          icon: this.props.arrangeTool,
          priority: `implicit`
        }))
      } else if (bar < foundNote.start + threshold) {
        this.props.dispatch(cursorResizeLeft('implicit'))
      } else if (bar > foundNote.end - threshold) {
        this.props.dispatch(cursorResizeRight('implicit'))
      } else {
        this.props.dispatch(cursorClear('implicit'))
      }

    // Clear cursor if not hovering over a note (but only for the current canvas)
    } else if (e.target === this.container) {
      switch(this.props.arrangeTool) {
        case 'pointer':
          this.props.dispatch(cursorClear('implicit'))
          this.props.dispatch({
            type: mouse.TOGGLE_TOOLTIP,
            payload: null
          })
          break
        case 'velocity':
          this.props.dispatch({
            type: mouse.TOGGLE_TOOLTIP,
            payload: null
          })
        default:
          this.props.dispatch(cursorChange({
            icon: this.props.arrangeTool,
            priority: `implicit`
          }))
      }
    }
  }

  mouseUpEvent(e) {
    // Cancel any sounds
    this.killPreviewSound()

    // First Click - Empty Area
    if (this.lastEvent &&
        this.lastEvent.action === SELECT_EMPTY_AREA) {
      // Prepare for possibility of second click
      this.lastEvent.action = CLICK_EMPTY_AREA
      this.props.dispatch(pianorollSelectionBoxApply(e.shiftKey))
      return
    }

    // First Click - Note
    if (this.lastEvent &&
        this.lastEvent.action === SELECT_NOTE) {
      // Cancel Cursor
      this.props.dispatch(cursorClear('explicit'))

      // Prepare for possibility of second click
      this.lastEvent.action = CLICK_NOTE
      return
    }

    // Selection Box Completed
    if (this.lastEvent &&
        this.lastEvent.action === SELECTION_BOX) {
      this.props.dispatch(pianorollSelectionBoxApply(e.shiftKey))
      this.lastEvent = null
      return
    }

    // Selected Notes Dragged
    if (this.lastEvent &&
        this.lastEvent.action === DRAG_NOTE) {
      this.props.dispatch(phraseDropNoteSelection())
      this.lastEvent = null
      return
    }

    // Change Velocity
    if (this.lastEvent &&
        this.lastEvent.action === CHANGE_NOTE_VELOCITY) {
      this.props.dispatch(phraseDropNoteVelocity())
      this.lastEvent = null
    }

    // Comment Range Selection End
    if (this.lastEvent &&
        this.lastEvent.action === COMMENT_GRIP) {
      let bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount
      this.props.dispatch(commentSelectionEnd({ end: bar }))
    }

    // No Action - Clear the queue
    this.lastEvent = null
  }

  commentGripEvent(e) {
    let bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount
    this.lastEvent = {
      action: COMMENT_GRIP,
      bar,
    }

    this.props.dispatch(commentSelectionStart({
      start: bar,
      trackID: this.props.currentTrack.id
    }))
  }

  commentDragEvent(e) {
    if (this.lastEvent && this.lastEvent.action === COMMENT_GRIP) {
      let bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount
      this.props.dispatch(commentSelectionEnd({ end: bar }))
    }
  }

  previewNoteSound(keyNum, velocity = 127) {
    // Cancel any previous key
    if (this.lastKeysPlayed && (this.lastKeysPlayed.length > 1 || this.lastKeysPlayed[0] !== keyNum))
      this.killPreviewSound()

    // Play new key
    keyNum = Math.ceil(keyNum)
    this.props.ENGINE.fireNote({ trackID: this.props.currentTrack.id, keyNum, velocity, disableRecording: true })
    this.lastKeysPlayed = [{ keyNum, velocity }]
  }

  previewDragSound(offsetKey) {
    let selectedKeys = _.chain(this.props.notes)
      .filter(note => note.selected)
      .map(note => ({ keyNum: note.keyNum + Math.round(offsetKey), velocity: note.velocity }))
      .uniqBy(note => note.keyNum)
      .sortBy(note => note.keyNum)
      .value()

    // Fire actions only if there has been a change
    let addedKeys = _.differenceBy(selectedKeys, this.lastKeysPlayed, note => note.keyNum)
    let lostKeys  = _.differenceBy(this.lastKeysPlayed, selectedKeys, note => note.keyNum)
    if (addedKeys.length > 0 || lostKeys.length > 0) {
      // Cancel previous keys
      this.killPreviewSound()

      // Play new key
      selectedKeys.forEach(note => {
        this.props.ENGINE.fireNote({ trackID: this.props.currentTrack.id, keyNum: note.keyNum, velocity: note.velocity, disableRecording: true })
      })

      // Store the active state
      this.lastKeysPlayed = selectedKeys
    }
  }

  killPreviewSound() {
    if (this.lastKeysPlayed) {
      this.lastKeysPlayed.forEach(note => {
        this.props.ENGINE.killNote({ trackID: this.props.currentTrack.id, keyNum: note.keyNum, disableRecording: true })
      })
    }
    this.lastKeysPlayed = null
  }

  handleResize() {
    this.props.dispatch(pianorollResizeWidth(this.props.grid.width  / this.props.grid.pixelScale - this.props.grid.marginLeft))
    this.props.dispatch(pianorollResizeHeight(this.props.grid.height / this.props.grid.pixelScale - this.props.grid.marginTop))
  }

  getNoteAtBarKey(bar, key) {
    return _.findLast(this.props.notes, note => (
      Math.ceil(key) === note.keyNum &&
      bar >= note.start &&
      bar <= note.end
    ))
  }

  getPercentX(e) {
    return (e.clientX - this.container.getBoundingClientRect().left) / this.container.getBoundingClientRect().width
  }

  getPercentY(e) {
    return (e.clientY - this.container.getBoundingClientRect().top) / this.container.getBoundingClientRect().height
  }
}

PianorollWindowControl.propTypes = {
  ENGINE:       engineShape.isRequired,
  dispatch:     React.PropTypes.func.isRequired,
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  barCount:     React.PropTypes.number.isRequired,
  keyCount:     React.PropTypes.number.isRequired,
  xMin:         React.PropTypes.number.isRequired,
  xMax:         React.PropTypes.number.isRequired,
  yMin:         React.PropTypes.number.isRequired,
  yMax:         React.PropTypes.number.isRequired,
  currentTrack: React.PropTypes.object,
  notes:        React.PropTypes.array.isRequired
}

export default
connect(state => ({
  existingPhrase: state.phraseMeta.phraseId,
  ownerOfPhrase: state.phraseMeta.authorUsername === state.auth.user.username,
  arrangeTool: state.arrangeTool.currentTool,
  mouse: state.mouse,
}))(
  connectEngine(
    provideGridSystem(
      provideGridScroll(
        PianorollWindowControl,
        {
          scrollXActionCreator: pianorollScrollX,
          scrollYActionCreator: pianorollScrollY,
          cursorActionCreator: pianorollMoveCursor
        }
      )
    )
  )
)
