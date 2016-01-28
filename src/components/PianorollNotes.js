// ============================================================================
// Piano Roll Notes
// ============================================================================
// This Component renders the notes in the piano roll. This component takes
// care of multiple selection of notes. Each note is a separate child component,
// with it's own handlers for dragging and resizing (see PianorollNotes).

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import { pianorollSelectionStart,
         pianorollSelectionEnd } from '../actions/actionsPianoroll.js';
import { phraseCreateNote } from '../actions/actionsPhrase.js';

import PianorollNote from './PianorollNote';

export default class PianorollNotes extends Component {

  constructor() {
    super();

    this.isDragging = false;
    this.lastClickTimestamp = 0

    this.handleGrip = this.handleGrip.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  render() {
    return (
      <div className="pianoroll-notes">
        {this.props.notes.map(function(note){

          let id     = note.id;
          let keyNum = note.keyNum
          let top    = (this.props.keyCount - note.keyNum    ) / this.props.keyCount * 100 + 0.10;
          let bottom = (this.props.keyCount - note.keyNum - 1) / this.props.keyCount * 100 + 0.25;
          let left   = note.start / this.props.barCount * 100;
          let right  = note.end   / this.props.barCount * 100;
          let width  = right - left;
          let height = top - bottom;
          let trackID  = this.props.currentTrack.id
          let selected = note.selected
          let dispatch = this.props.dispatch
          let props  = {id, keyNum, top, left, width, height, trackID, selected, dispatch};
          return (<PianorollNote key={note.id} {...props} />);

        }.bind(this))}
      </div>
    );
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.notes !== this.props.notes
  }

  componentDidMount() {
    this.container = ReactDOM.findDOMNode(this);
    document.addEventListener("mousemove", this.handleDrag);
    document.addEventListener("mouseup",   this.handleDrop);
    this.container.addEventListener("mousedown", this.handleGrip);
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.handleDrag);
    document.removeEventListener("mouseup",   this.handleDrop);
    this.container.removeEventListener("mousedown", this.handleGrip);
  }

  handleGrip(e) {
    if (e.target !== this.container)
      return

    var x = this.getPercentX(e);
    var y = this.getPercentY(e);

    // Doubleclick - Create Note
    if (Date.now() - this.lastClickTimestamp < 640 && this.lastClickX == x && this.lastClickY == y) {
      let bar = this.getPercentX(e) * this.props.barCount;
      let key = Math.ceil(this.props.keyCount - this.getPercentY(e)*this.props.keyCount);
      this.props.dispatch( phraseCreateNote(this.props.currentTrack.id, key, bar) );

    // Singleclick - Selection Box
    } else {
      this.props.dispatch( pianorollSelectionStart(x,y) );

      this.isDragging = true;
      this.lastClickTimestamp = Date.now()
      this.lastClickX = x
      this.lastClickY = y
    }
  }

  handleDrag(e) {
    // Ignore unrelated move events
    if( !this.isDragging )
      return;

    let x = this.getPercentX(e);
    let y = this.getPercentY(e);
    this.props.dispatch( pianorollSelectionEnd(x,y) );
  }

  handleDrop(e) {
    // Remove selection box
    if (this.isDragging) {
      // TODO: Batch these actions
      this.props.dispatch( pianorollSelectionStart(null,null) );
      this.props.dispatch( pianorollSelectionEnd(null,null) );      
    }

    this.isDragging = false;
  }

  getPercentX(e) {
    return (e.clientX - this.container.getBoundingClientRect().left) / this.container.getBoundingClientRect().width;
  }

  getPercentY(e) {
    return (e.clientY - this.container.getBoundingClientRect().top) / this.container.getBoundingClientRect().height;
  }
}

PianorollNotes.propTypes = {
  currentTrack: React.PropTypes.object,
  barCount:     React.PropTypes.number.isRequired,
  keyCount:     React.PropTypes.number.isRequired,
  notes:        React.PropTypes.array
};
