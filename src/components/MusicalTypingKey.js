import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import connectEngine from '../audio/AudioEngineConnect.js'

export class MusicalTypingKey extends Component {

  render() {
    let keyName
    switch (this.props.keyInitial) {
      case ';': keyName = 'colon'; break
      case "'": keyName = 'quote'; break
      default:  keyName = this.props.keyInitial.toLowerCase()
    }

    let keyClasses = "musical-typing-key"
        keyClasses += ` musical-typing-key-${this.props.color}`
        keyClasses += ` musical-typing-key-${keyName}`
    let labelClasses = "musical-typing-key-label"
        labelClasses += this.props.active ? ' active' : ''

    return (
      <div className={keyClasses}>
        <div className={labelClasses}>
          { this.props.keyInitial.toUpperCase() }
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

  mouseDownEvent = () => {
    this.props.ENGINE.fireNote({ trackID: this.props.currentTrackID, keyNum: this.props.keyNum, velocity: 127 })
    this.keydown = true
  }

  mouseUpEvent = () => {
    if (this.keydown) {
      this.props.ENGINE.killNote({ trackID: this.props.currentTrackID, keyNum: this.props.keyNum })
      this.keydown = false
    }
  }

}

export default connectEngine(MusicalTypingKey)
