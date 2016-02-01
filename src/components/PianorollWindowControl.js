import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import provideGridSystem from './GridSystemProvider'
import provideGridScroll from './GridScrollProvider'

import _ from 'lodash'
import { pianorollScrollX,
         pianorollScrollY,
         pianorollMoveCursor,
         pianorollSelectionStart,
         pianorollSelectionEnd } from '../actions/actionsPianoroll.js';
import { phraseCreateNote } from '../actions/actionsPhrase.js';

export class PianorollWindow extends Component {

  constructor() {
    super();

    this.isDragging = false;
    this.lastClickTimestamp = 0

    this.handleGrip = this.handleGrip.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  componentDidMount() {
    this.props.grid.marginTop    =  0
    this.props.grid.marginBottom = 30
    this.props.grid.marginLeft   = 10
    this.props.grid.marginRight  = 10

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

  render() {
    return (
      <div className="pianoroll-window-control">
        {this.props.children}
      </div>
    );
  }

  handleGrip(e) {
    if (e.target !== this.container)
      return

    var x = this.getPercentX(e);
    var y = this.getPercentY(e);

    // Doubleclick - Create Note
    if (Date.now() - this.lastClickTimestamp < 640 && this.lastClickX == x && this.lastClickY == y) {
      let bar = (this.props.xMin + this.props.grid.getMouseXPercent(e)*this.props.grid.getBarRange()) * this.props.barCount;
      let key = Math.ceil(this.props.keyCount - (this.props.yMin + this.props.grid.getMouseYPercent(e)*this.props.grid.getKeyRange())*this.props.keyCount);
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

PianorollWindow.propTypes = {
  dispatch:     React.PropTypes.func.isRequired,
  grid:         React.PropTypes.object.isRequired,  // via provideGridSystem & provideGridScroll
  barCount:     React.PropTypes.number.isRequired,
  keyCount:     React.PropTypes.number.isRequired,
  xMin:         React.PropTypes.number.isRequired,
  xMax:         React.PropTypes.number.isRequired,
  yMin:         React.PropTypes.number.isRequired,
  yMax:         React.PropTypes.number.isRequired,
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
