// ============================================================================
// Piano Roll Notes
// ============================================================================
// This Component renders the notes in the piano roll. This component takes
// care of multiple selection of notes. Each note is a separate child component,
// with it's own handlers for dragging and resizing (see PianoRollNotes).

import React, { Component } from 'react';

import { pianoRollSelectionStart,
         pianoRollSelectionEnd,
         pianoRollNewNote } from '../actions/actions.js';

import PianoRollNote from './PianoRollNote';

export default class PianoRollNotes extends Component {

  constructor() {
    super();
    this.data = {};
    this.data.isDragging = false;
    this.handleGrip = this.handleGrip.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  render() {
    return (
      <div className="piano-roll-notes">
        {this.props.notes.map(function(note){

          let id     = note.id;
          let keyNum = note.keyNum
          let top    = (this.props.keyCount - note.keyNum    ) / this.props.keyCount * 100 + 0.15;
          let bottom = (this.props.keyCount - note.keyNum - 1) / this.props.keyCount * 100 + 0.30;
          let left   = note.start / this.props.barCount * 100;
          let right  = note.end   / this.props.barCount * 100;
          let width  = right - left;
          let height = top - bottom;
          let dispatch = this.props.dispatch
          let props  = {id, keyNum, top, left, width, height, dispatch};

          return (<PianoRollNote key={note.id} {...props} />);

        }.bind(this))}
      </div>
    );
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.notes !== this.props.notes
  }

  componentDidMount() {
    this.data.container = React.findDOMNode(this);
    document.addEventListener("mousemove", this.handleDrag);
    document.addEventListener("mouseup",   this.handleDrop);
    this.data.container.addEventListener("mousedown", this.handleGrip);
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.handleDrag);
    document.removeEventListener("mouseup",   this.handleDrop);
    this.data.container.removeEventListener("mousedown", this.handleGrip);
  }

  handleGrip(e) {
    this.data.isDragging = 1;

    let x = this.getMouseBar(e);
    let y = this.getMouseKey(e);
    this.props.dispatch( pianoRollSelectionStart(x,y) );
  }

  handleDrag(e) {
    // Ignore unrelated move events
    if( !this.data.isDragging )
      return;

    // Minimum movement before creating selection box
    if( this.data.isDragging > 1)
    {
      let x = this.getMouseBar(e);
      let y = this.getMouseKey(e);
      this.props.dispatch( pianoRollSelectionEnd(x,y) );
    }

    // Track minimum required movement
    this.data.isDragging++;
  }

  handleDrop(e) {
    // Remove selection box
    if( this.data.isDragging > 2 )
    {
      this.props.dispatch( pianoRollSelectionEnd(null,null) );
      this.props.dispatch( pianoRollSelectionEnd(null,null) );      
    }

    // Add New Note
    else if( this.data.isDragging ) // no extended drag - this is basically a click!
    {
      let bar = this.getMouseBar(e) * this.props.barCount;
      let key = Math.ceil(this.props.keyCount - this.getMouseKey(e)*this.props.keyCount);
      this.props.dispatch( pianoRollNewNote(key,bar) );
    }

    this.data.isDragging = false;
  }

  getMouseBar(e) {
    return (e.clientX - this.data.container.getBoundingClientRect().left) / this.data.container.getBoundingClientRect().width;
  }

  getMouseKey(e) {
    return (e.clientY - this.data.container.getBoundingClientRect().top) / this.data.container.getBoundingClientRect().height;
  }
}

PianoRollNotes.propTypes = {
  barCount:     React.PropTypes.number.isRequired,
  keyCount:     React.PropTypes.number.isRequired,
  notes:        React.PropTypes.array
};
