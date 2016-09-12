import React, { Component } from 'react'
import { connect } from 'react-redux'

import { phraseSetTempo } from 'reducers/reducePhrase'

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
      <div className="btn-group hidden-xs">
        <div className="transport-tempo-container">
          { this.props.editable &&
            <input className="form-control form-control-glow transport-tempo"
              type="number" min={MIN_TEMPO} max={MAX_TEMPO} step={1}
              value={this.state.tempo}
              onChange={this.handleChange}
              onKeyDown={this.handleKeyDown}
              onMouseDown={this.handleMouseDown}
              onBlur={this.handleBlur}
              tabIndex={-1}
            />
            ||
            <input
              className="form-control form-control-glow transport-tempo transport-tempo-disabled disable-select"
              defaultValue={this.props.tempo}
              tabIndex={-1} readOnly={true}
            />
          }
          <span>BPM</span>
        </div>
      </div>
    )
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
  }

  handleMouseDown = (e) => {
    this.dragging = true
    e.preventDefault()
    e.target.select()
    e.target.requestPointerLock = e.target.requestPointerLock || e.target.mozRequestPointerLock
    if (e.target.requestPointerLock) {
      e.target.requestPointerLock()
    } else {
      this.pointerLockFallback = true
      this.lastValue = this.state.tempo
    }
  }

  handleMouseMove = (e) => {
    if (this.dragging && !this.pointerLockFallback) {
      let deltaX = e.movementX || e.mozMovementX || 0
      let deltaY = e.movementY || e.mozMovementY || 0
      e.target.value = this.validateTempo(parseInt(e.target.value) + deltaX - deltaY)
      this.setState({ tempo: parseInt(e.target.value) })
    } else if (this.dragging && this.pointerLockFallback) {
      let offsetY = this.props.mouse.y - this.props.mouse.downY
      let tempo = this.validateTempo(Math.round(this.lastValue - offsetY))
      this.setState({ tempo })
    }
  }

  handleMouseUp = (e) => {
    this.dragging = false
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock
    if (document.exitPointerLock) {
      document.exitPointerLock()
    }
    this.props.dispatch(phraseSetTempo(this.state.tempo))
    if (e.target.select) e.target.select()
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
    tempo: state.phrase.present.tempo,
    mouse: state.mouse,
  }
}

export default connect(mapStateToProps)(TransportTempo)
