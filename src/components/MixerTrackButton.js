import React, { Component } from 'react'
import ReactDOM from 'react-dom'

export default class MixerTrackButton extends Component {

  constructor() {
    super(...arguments)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e) {
    this.props.dispatch( this.props.action(this.props.trackID) )
  }

  render() {
    var buttonClasses = "mixer-track-btn " + this.props.buttonClasses
        buttonClasses += this.props.active ? " active" : ""

    return (
      <button className={buttonClasses} onClick={this.handleClick}>
        {this.props.children}
      </button>
    )
  }
}

MixerTrackButton.propTypes = {
  dispatch:       React.PropTypes.func.isRequired,
  action:         React.PropTypes.func.isRequired,
  buttonClasses:  React.PropTypes.string.isRequired,
  trackID:        React.PropTypes.number.isRequired,
  active:         React.PropTypes.bool
}
