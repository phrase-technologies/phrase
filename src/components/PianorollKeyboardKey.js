import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import connectEngine from '../audio/AudioEngineConnect.js'
import engineShape   from '../audio/AudioEnginePropTypes.js'

export class PianorollKeyboardKey extends Component {

  render() {
    return (
      <div className={this.props.keyClass}>
        <div className="pianoroll-key-label">
          {this.props.keyLabel}
        </div>
      </div>
    )
  }

  constructor() {
    super(...arguments)
    this.mouseDownEvent = this.mouseDownEvent.bind(this)
    this.mouseUpEvent   = this.mouseUpEvent.bind(this)
    this.keydown = false
  }

  componentDidMount() {
    this.container = ReactDOM.findDOMNode(this)
    this.container.addEventListener('mousedown', this.mouseDownEvent)
    document.addEventListener('mouseup',   this.mouseUpEvent)
  }

  componentWillUnmount() {
    this.container.removeEventListener('mousedown', this.mouseDownEvent)
    document.removeEventListener('mouseup',   this.mouseUpEvent)
  }

  mouseDownEvent(e) {
    var velocity = 127 * (e.clientX - this.container.getBoundingClientRect().left) / this.container.getBoundingClientRect().width
    this.props.ENGINE.fireNote(this.props.currentTrack.id, this.props.keyNum, velocity)
    this.keydown = true
  }

  mouseUpEvent(e) {
    if (this.keydown) {
      this.props.ENGINE.killNote(this.props.currentTrack.id, this.props.keyNum)
      this.keydown = false
    }
  }

}

PianorollKeyboardKey.propTypes = {
  ENGINE:       engineShape.isRequired,
  currentTrack: React.PropTypes.object.isRequired,
  keyNum:       React.PropTypes.number.isRequired,
  keyClass:     React.PropTypes.string.isRequired,
  keyLabel:     React.PropTypes.string
}

export default connectEngine(PianorollKeyboardKey)