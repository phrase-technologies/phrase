import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'

import _ from 'lodash'
import { pianorollScrollX,
         pianorollScrollY,
         pianorollResizeWidth,
         pianorollResizeHeight,
         pianorollMoveCursor,
         pianorollSelectionBoxStart,
         pianorollSelectionBoxResize,
         pianorollSelectionBoxApply } from '../actions/actionsPianoroll.js';
import { phraseCreateNote,
         phraseSelectNote,
         phraseDeleteNote,
         phraseDragNoteSelection,
         phraseDropNoteSelection } from '../actions/actionsPhrase.js';
import { cursorResizeLeft,
         cursorResizeRight,
         cursorClear } from '../actions/actionsCursor.js';         

const SELECT_EMPTY_AREA = "SELECT_EMPTY_AREA"
const CLICK_EMPTY_AREA  = "CLICK_EMPTY_AREA"
const SELECT_NOTE       = "SELECT_NOTE"
const CLICK_NOTE        = "CLICK_NOTE"
const DRAG_NOTE         = "DRAG_NOTE"
const SELECTION_BOX     = "SELECTION_BOX"
const DOUBLECLICK_DELAY = 360

export class PianorollWindowControl extends Component {

  render() {
    return (
      <div className="pianoroll-window-control">
        {this.props.children}
      </div>
    );
  }

  constructor() {
    super(...arguments)
    this.handleResize   = this.handleResize.bind(this)
    this.mouseDownEvent = this.mouseDownEvent.bind(this)
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this)
    this.mouseUpEvent   = this.mouseUpEvent.bind(this)
  }

  componentDidMount() {
    // Setup Grid System
    this.props.grid.marginTop    =  0
    this.props.grid.marginBottom =  0
    this.props.grid.marginLeft   = 10
    this.props.grid.marginRight  = 10
    this.props.grid.didMount()

    // Event Sources
    this.container = ReactDOM.findDOMNode(this);
    this.container.addEventListener("mousedown", this.mouseDownEvent)
    document.addEventListener("mousemove", this.mouseMoveEvent)
    document.addEventListener("mouseup",   this.mouseUpEvent)
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  componentWillUnmount() {
    this.container.removeEventListener("mousedown", this.mouseDownEvent)
    document.removeEventListener("mousemove", this.mouseMoveEvent)
    document.removeEventListener("mouseup",   this.mouseUpEvent)
    window.removeEventListener('resize', this.handleResize);
  }

  mouseDownEvent(e) {
    // Ensure clicks from the scrollbars don't interfere
    if (e.target !== this.container)
      return

    switch(e.which) {
      default:
      case 1: 
      case 2: this.leftClickEvent(e);  break
      case 3: this.rightClickEvent(e); break
    }
  }

  leftClickEvent(e) {
    var bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount;
    var key = (this.props.keyCount - (this.props.yMin + this.props.grid.getMouseYPercent(e)*this.props.grid.getKeyRange())*this.props.keyCount);
    var foundNote = this.getNoteAtBarKey(bar, key)

    if (foundNote) {
      this.noteEvent(e, bar, key, foundNote)
    } else {
      this.emptyAreaEvent(e, bar, key)
    }
  }

  noteEvent(e, bar, key, foundNote) {
    // Second Click - Note
    if (this.lastEvent &&
        this.lastEvent.action == CLICK_NOTE) {
      // Double click - Delete Note
      if (Date.now() - this.lastEvent.time < DOUBLECLICK_DELAY) {
        this.props.dispatch( phraseDeleteNote(foundNote.id) )
        this.lastEvent = null
        return
      // Too slow, treat as new first click
      } else {
        this.lastEvent = null
      }
    }

    // First Click - Start Selection
    if (!this.lastEvent) {
      this.lastEvent = {
        action: SELECT_NOTE,
        noteID: foundNote.id,
        bar: bar,
        key: key,
        time: Date.now()
      }
      var noteLength = foundNote.end - foundNote.start
      var threshold = Math.min(
        8*this.props.grid.pixelScale/this.props.grid.width*this.props.grid.getBarRange()*this.props.barCount,
        0.25*noteLength
      )

      if (!foundNote.selected) {
        this.props.dispatch( phraseSelectNote(foundNote.id, e.shiftKey) )
      }

      if (bar < foundNote.start + threshold) {
        this.props.dispatch( cursorResizeLeft )
        this.lastEvent.grip = "MIN"
      } else if (bar > foundNote.end - threshold) {
        this.props.dispatch( cursorResizeRight )
        this.lastEvent.grip = "MAX"
      } else {
        this.props.dispatch( cursorClear )
        this.lastEvent.grip = "MID"
      }
    }
  }

  emptyAreaEvent(e, bar, key) {
    // Second Click - Empty Area
    if (this.lastEvent &&
        this.lastEvent.action == CLICK_EMPTY_AREA) {
      // Double click - Create Note
      if (Date.now() - this.lastEvent.time < DOUBLECLICK_DELAY) {
        this.props.dispatch( phraseCreateNote(this.props.currentTrack.id, bar, key) )
        this.lastEvent = null
        return
      // Too slow, treat as new first click
      } else {
        this.lastEvent = null
      }
    }

    // First Click - Start Selection
    if (!this.lastEvent) {
      this.props.dispatch( pianorollSelectionBoxStart(bar, key) )
      this.lastEvent = {
        action: SELECT_EMPTY_AREA,
        bar: bar,
        key: key,
        time: Date.now()
      }
      return
    }
  }

  mouseMoveEvent(e) {
    // Ensure events from other components don't interfere!
    if (e.target !== this.container)
      return

    var bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount;
    var key = this.props.keyCount - (this.props.yMin + this.props.grid.getMouseYPercent(e)*this.props.grid.getKeyRange())*this.props.keyCount;

    // Drag Selected Note(s)?
    if (this.lastEvent &&
       (this.lastEvent.action == SELECT_NOTE ||
        this.lastEvent.action == DRAG_NOTE)) {
      // Adjust Note
      let offsetBar = bar - this.lastEvent.bar
      switch (this.lastEvent.grip) {
        case 'MIN': var offsetStart = offsetBar; var offsetEnd =         0; var offsetKey = 0; break;
        case 'MID': var offsetStart = offsetBar; var offsetEnd = offsetBar; var offsetKey = key - this.lastEvent.key; break;
        case 'MAX': var offsetStart =         0; var offsetEnd = offsetBar; var offsetKey = 0; break;
      }
      this.props.dispatch( phraseDragNoteSelection(this.lastEvent.noteID, offsetStart, offsetEnd, offsetKey, !e.altKey) )
      this.lastEvent.action = DRAG_NOTE
      return
    }

    // Selection Box?
    if (this.lastEvent &&
       (this.lastEvent.action == SELECT_EMPTY_AREA ||
        this.lastEvent.action == SELECTION_BOX) ) {
      // Resize Selection Box
      this.props.dispatch( pianorollSelectionBoxResize(bar, key) )
      this.lastEvent.action = SELECTION_BOX
      return
    }

    // No Action - Clear the queue
    this.lastEvent = null

    // Cursor on hover over notes
    this.hoverEvent(e, bar, key)
  }

  hoverEvent(e, bar, key) {
    var foundNote = this.getNoteAtBarKey(bar, key)
    if (foundNote) {
      var noteLength = foundNote.end - foundNote.start
      var threshold = Math.min(
        8*this.props.grid.pixelScale/this.props.grid.width*this.props.grid.getBarRange()*this.props.barCount,
        0.25*noteLength
      )

      if (bar < foundNote.start + threshold) {
        this.props.dispatch( cursorResizeLeft )
      } else if (bar > foundNote.end - threshold) {
        this.props.dispatch( cursorResizeRight )
      } else {
        this.props.dispatch( cursorClear )
      }
    // Clear cursor if not hovering over a note
    } else {
      this.props.dispatch( cursorClear )
    }    
  }

  mouseUpEvent(e) {
    // First Click - Empty Area
    if (this.lastEvent &&
        this.lastEvent.action == SELECT_EMPTY_AREA) {
      // Prepare for possibility of second click
      this.lastEvent.action = CLICK_EMPTY_AREA
      this.props.dispatch( pianorollSelectionBoxApply(e.shiftKey) )
      return
    }

    // First Click - Note
    if (this.lastEvent &&
        this.lastEvent.action == SELECT_NOTE) {
      // Cancel Cursor
      this.props.dispatch( cursorClear )

      // Prepare for possibility of second click
      this.lastEvent.action = CLICK_NOTE
      return
    }

    // Selection Box Completed
    if (this.lastEvent &&
        this.lastEvent.action == SELECTION_BOX) {
      this.props.dispatch( pianorollSelectionBoxApply(e.shiftKey) )
      this.lastEvent = null
      return
    }

    // Selected Notes Dragged
    if (this.lastEvent &&
        this.lastEvent.action == DRAG_NOTE) {
      this.props.dispatch( phraseDropNoteSelection() )
      this.lastEvent = null
      return
    }

    // No Action - Clear the queue
    this.lastEvent = null
  }

  handleResize() {
    this.props.dispatch(pianorollResizeWidth( this.props.grid.width  / this.props.grid.pixelScale - this.props.grid.marginLeft));
    this.props.dispatch(pianorollResizeHeight(this.props.grid.height / this.props.grid.pixelScale - this.props.grid.marginTop ));
  }

  getNoteAtBarKey(bar, key) {
    return this.props.notes.find(note => (
      Math.ceil(key) == note.keyNum &&
      bar >= note.start &&
      bar <= note.end          
    ))
  }

  getPercentX(e) {
    return (e.clientX - this.container.getBoundingClientRect().left) / this.container.getBoundingClientRect().width;
  }

  getPercentY(e) {
    return (e.clientY - this.container.getBoundingClientRect().top) / this.container.getBoundingClientRect().height;
  }
}

PianorollWindowControl.propTypes = {
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

export default provideGridSystem(
  provideGridScroll(
    PianorollWindowControl,
    {
      scrollXActionCreator: pianorollScrollX,
      scrollYActionCreator: pianorollScrollY,
      cursorActionCreator: pianorollMoveCursor
    }
  )
)
