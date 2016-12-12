import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import connectEngine from '../audio/AudioEngineConnect.js'
import engineShape   from '../audio/AudioEnginePropTypes.js'

export class PianorollKeyboardKey extends Component {

  render() {
    return (
      <div className={this.props.keyClass}>
        <div className={ this.props.midiController ? "midi-controller-key-label" : "pianoroll-key-label" }>
          {this.props.keyLabel}
        </div>
      </div>
    )
  }

  componentDidMount() {
    this.keydown = false
    this.container = ReactDOM.findDOMNode(this)
    this.container.addEventListener('mousedown', this.mouseDownEvent)
    document.addEventListener('mouseup',   this.mouseUpEvent)
  }

  componentWillUnmount() {
    this.container.removeEventListener('mousedown', this.mouseDownEvent)
    document.removeEventListener('mouseup',   this.mouseUpEvent)
  }

  mouseDownEvent = (e) => {
    let velocity = this.props.midiController
      ? 127 * (e.clientY - this.container.getBoundingClientRect().top) / this.container.getBoundingClientRect().height
      : 127 * (e.clientX - this.container.getBoundingClientRect().left) / this.container.getBoundingClientRect().width
    this.props.ENGINE.fireNote({ trackID: this.props.currentTrackID, keyNum: this.props.keyNum, velocity })
    this.keydown = true
  }

  mouseUpEvent = () => {
    if (this.keydown) {
      this.props.ENGINE.killNote({ trackID: this.props.currentTrackID, keyNum: this.props.keyNum })
      this.keydown = false
    }
  }

}

PianorollKeyboardKey.propTypes = {
  ENGINE:       engineShape.isRequired,
  currentTrackID: React.PropTypes.number.isRequired,
  keyNum:       React.PropTypes.number.isRequired,
  keyClass:     React.PropTypes.string.isRequired,
  keyDown:      React.PropTypes.bool,
  keyLabel:     React.PropTypes.string
}

export default connectEngine(PianorollKeyboardKey)
