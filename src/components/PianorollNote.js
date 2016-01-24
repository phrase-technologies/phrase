import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import { phraseSelectNote } from '../actions/actionsPhrase.js'

export default class PianorollNote extends Component {
  render() {
    let pianorollClasses = "pianoroll-note-label"
        pianorollClasses += this.props.selected ? ' pianoroll-note-selected' : ''
    let noteStyle = {
      top: this.props.top+'%',
      left: this.props.left+'%',
      width: this.props.width+'%',
      height: this.props.height+'%'
    };
    let keyLetter = {1:'A',2:'A#',3:'B',4:'C',5:'C#',6:'D',7:'D#',8:'E',9:'F',10:'F#',11:'G',0:'G#'}[this.props.keyNum % 12];
    let label = keyLetter + Math.floor((this.props.keyNum+8)/12);

    return (
      <div className="pianoroll-note" style={noteStyle}>
        <div className={pianorollClasses}>
          {label}
        </div>
      </div>
    );
  }

  constructor() {
    super()
    this.isDragging = false
    this.handleGrip = this.handleGrip.bind(this)
    this.handleDrag = this.handleDrag.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
  }

  componentDidMount() {
    this.container = ReactDOM.findDOMNode(this)
    this.parent = this.container.parentElement
    document.addEventListener("mousemove", this.handleDrag)
    document.addEventListener("mouseup",   this.handleDrop)
    this.container.addEventListener("mousedown", this.handleGrip)
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.handleDrag)
    document.removeEventListener("mouseup",   this.handleDrop)
    this.container.removeEventListener("mousedown", this.handleGrip)
  }

  handleGrip(e) {
    if (e.target !== this.container)
      return

    this.isDragging = 1

    this.startBar = this.getPercentX(e)
    this.startKey = this.getPercentY(e)

    this.props.dispatch( phraseSelectNote(0, this.props.id) );
  }

  handleDrag(e) {
    // Ignore unrelated move events
    if( !this.isDragging )
      return;

    // Minimum movement before dragging note
    if( this.isDragging > 1)
    {
      let barDelta = this.getPercentX(e) - this.startBar;
      let keyDelta = this.getPercentY(e) - this.startKey;
      //this.props.dispatch( pianorollSelectionEnd(x,y) );
    }

    // Track minimum required movement
    this.isDragging++;
  }

  handleDrop(e) {
    // Persist proposed note change
    if( this.isDragging > 2 )
    {
      let barDelta = this.getPercentX(e) - this.startBar;
      let keyDelta = this.getPercentY(e) - this.startKey;
      // this.props.dispatch( pianorollSelectionEnd(null,null) );      
    }

    this.isDragging = false;
  }

  getPercentX(e) {
    return (e.clientX - this.parent.getBoundingClientRect().left) / this.parent.getBoundingClientRect().width;
  }

  getPercentY(e) {
    return (e.clientY - this.parent.getBoundingClientRect().top) / this.parent.getBoundingClientRect().height;
  }

}

PianorollNote.propTypes = {
  id:       React.PropTypes.number.isRequired,
  keyNum:   React.PropTypes.number.isRequired,
  top:      React.PropTypes.number.isRequired,
  left:     React.PropTypes.number.isRequired,
  width:    React.PropTypes.number.isRequired,
  height:   React.PropTypes.number.isRequired,
  select:   React.PropTypes.bool,
  dispatch: React.PropTypes.func.isRequired
};
