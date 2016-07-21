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
    let velocity = 127 * (e.clientX - this.container.getBoundingClientRect().left) / this.container.getBoundingClientRect().width
    this.props.ENGINE.fireNote({ trackID: this.props.currentTrack.id, keyNum: this.props.keyNum, velocity })
    this.keydown = true
  }

  mouseUpEvent = () => {
    if (this.keydown) {
      this.props.ENGINE.killNote({ trackID: this.props.currentTrack.id, keyNum: this.props.keyNum })
      this.keydown = false
    }
  }

}

PianorollKeyboardKey.propTypes = {
  ENGINE:       engineShape.isRequired,
  currentTrack: React.PropTypes.object.isRequired,
  keyNum:       React.PropTypes.number.isRequired,
  keyClass:     React.PropTypes.string.isRequired,
  keyDown:      React.PropTypes.bool,
  keyLabel:     React.PropTypes.string
}

export default connectEngine(PianorollKeyboardKey)
