import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'

import _ from 'lodash'
import Rx from 'rx'
import { pianorollScrollX,
         pianorollScrollY,
         pianorollMoveCursor,
         pianorollSelectionStart,
         pianorollSelectionEnd } from '../actions/actionsPianoroll.js';
import { phraseCreateNote,
         phraseSelectNote } from '../actions/actionsPhrase.js';

export class PianorollWindow extends Component {

  constructor() {
    super();

    this.isDragging = false;
    this.lastClickTimestamp = 0
  }

  render() {
    return (
      <div className="pianoroll-window-control">
        {this.props.children}
      </div>
    );
  }

  componentDidMount() {
    this.props.grid.marginTop    =  0
    this.props.grid.marginBottom = 30
    this.props.grid.marginLeft   = 10
    this.props.grid.marginRight  = 10

    this.container = ReactDOM.findDOMNode(this);
    this.mousedown$ = Rx.Observable.fromEvent(this.container, "mousedown")
    this.mousemove$ = Rx.Observable.fromEvent(document, "mousemove")
    this.mouseup$   = Rx.Observable.fromEvent(document, "mouseup")

    var foundNote$ = this.mousedown$.map(e => {
      let x = this.getPercentX(e);
      let y = this.getPercentY(e);
      let bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount;
      let key = Math.ceil(this.props.keyCount - (this.props.yMin + this.props.grid.getMouseYPercent(e)*this.props.grid.getKeyRange())*this.props.keyCount);
      let foundNote = this.props.notes.find(note => {
        return (
          Math.round(key) == note.keyNum &&
          bar >= note.start &&
          bar <= note.end          
        )
      })
      return {
        note: foundNote,
        bar: bar,
        key: key,
        x: x,
        y: y,
        shiftKey: e.shiftKey
      }
    })
    var emptyAreaSelected$ = foundNote$.filter(e =>  !e.note)
    var noteSelected$      = foundNote$.filter(e => !!e.note)

    this.setupEmptyAreaActions(emptyAreaSelected$)
    this.setupNoteActions(noteSelected$)
  }

  // All actions that stem from an initial click in an empty part of the track
  setupEmptyAreaActions(emptyAreaSelected$) {
    // Event Stream Flows
    var resizeSelectionBox$ = emptyAreaSelected$
      .flatMapLatest(() => this.mousemove$.takeUntil(this.mouseup$))
      .map(e => {
        var x = this.getPercentX(e);
        var y = this.getPercentY(e);
        return { x, y, shiftKey: e.shiftKey }
      })
    var applySelectionBox$ = resizeSelectionBox$
      .flatMapLatest(() => this.mouseup$.take(1))
      .map(e => {
        var x = this.getPercentX(e);
        var y = this.getPercentY(e);
        return { x, y, shiftKey: e.shiftKey }
      })
    var createNote$ = emptyAreaSelected$
      .timeInterval()
      .bufferWithCount(2, 1)
      .filter(buffer => {
        return buffer[1].interval < 640
            && buffer[0].value.bar === buffer[1].value.bar
            && buffer[0].value.key === buffer[1].value.key
      })
      .map(buffer => buffer[1].value)

    // Actions
    let dispatch = this.props.dispatch
    emptyAreaSelected$.subscribe(e => dispatch( pianorollSelectionStart(e.x, e.y) ) )
    resizeSelectionBox$.subscribe(e => dispatch( pianorollSelectionEnd(e.x, e.y) ) )
    applySelectionBox$.subscribe(e => {
      this.props.dispatch( pianorollSelectionStart(null, null) );
      this.props.dispatch( pianorollSelectionEnd(null, null) );
    })
    createNote$.subscribe(e => dispatch( phraseCreateNote(this.props.currentTrack.id, e.key, e.bar) ) )
  }

  // All actions that stem from an initial click on an existing note
  setupNoteActions(noteSelected$) {
    // Event Stream Flows
    var deleteNote$ = noteSelected$
      .timeInterval()
      .bufferWithCount(2, 1)
      .filter(buffer => buffer[1].interval < 640 && buffer[0].value.note.id === buffer[1].value.note.id)
      .map(buffer => buffer[1].value)

    // Actions
    let dispatch = this.props.dispatch
    noteSelected$.subscribe(e => dispatch( phraseSelectNote(this.props.currentTrack.id, e.note.id, e.shiftKey) ) )
    deleteNote$.subscribe(deletedNote => {
      console.log("deleteNote$:", deletedNote)
    })
  }

  getPercentX(e) {
    return (e.clientX - this.container.getBoundingClientRect().left) / this.container.getBoundingClientRect().width;
  }

  getPercentY(e) {
    return (e.clientY - this.container.getBoundingClientRect().top) / this.container.getBoundingClientRect().height;
  }
}

PianorollWindow.propTypes = {
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
    PianorollWindow,
    {
      scrollXActionCreator: pianorollScrollX,
      scrollYActionCreator: pianorollScrollY,
      cursorActionCreator: pianorollMoveCursor
    }
  )
)
