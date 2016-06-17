import React, { Component } from 'react'
import { connect } from 'react-redux'

import { phraseSetTempo } from 'reducers/reducePhrase.js'

export const MIN_TEMPO = 20
export const MAX_TEMPO = 9001

class TransportTempo extends Component {

  constructor(props) {
    super()
    this.state = {
      tempo: props.tempo || 120,
    }
  }

  render() {
    return (
      <div className="btn-group">
        <div className="transport-tempo-container">
          <input className="form-control form-control-glow transport-tempo"
            type="number" min={MIN_TEMPO} max={MAX_TEMPO} step={1} value={this.state.tempo}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp}
            onBlur={this.handleBlur}
            tabIndex={-1}
          />
          <span>BPM</span>
        </div>
      </div>
    )
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ tempo: nextProps.tempo })
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.handleMouseMove)
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove)
  }

  handleMouseDown = (e) => {
    this.dragging = true
    e.preventDefault()
    e.target.select()
    e.target.requestPointerLock = e.target.requestPointerLock || e.target.mozRequestPointerLock
    e.target.requestPointerLock()
  }

  handleMouseMove = (e) => {
    if (this.dragging) {
      let deltaX = e.movementX || e.mozMovementX || 0
      let deltaY = e.movementY || e.mozMovementY || 0
      e.target.value = this.validateTempo(parseInt(e.target.value) + deltaX - deltaY)
      this.setState({ tempo: parseInt(e.target.value) })
    }
  }

  handleMouseUp = (e) => {
    this.dragging = false
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock
    document.exitPointerLock()
    this.props.dispatch(phraseSetTempo(e.target.value))
    e.target.select()
  }

  handleChange = (e) => {
    this.setState({ tempo: parseInt(e.target.value) })
  }

  handleBlur = (e) => {
    this.props.dispatch(phraseSetTempo(this.validateTempo(parseInt(e.target.value))))
  }

  handleKeyDown = (e) => {
    switch (e.keyCode) {
      case 32: // Space
      case 13: // Enter
      case 27: // Escape
        e.target.value = this.validateTempo(parseInt(e.target.value))
        e.target.blur()
        break
    }
  }

  validateTempo(tempo) {
    return Math.max(MIN_TEMPO, Math.min(MAX_TEMPO, tempo || 0))
  }

}

function mapStateToProps(state) {
  return {
    tempo:   state.phrase.present.tempo,
  }
}

export default connect(mapStateToProps)(TransportTempo)
