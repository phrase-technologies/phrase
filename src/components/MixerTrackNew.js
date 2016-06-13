import React, { Component } from 'react'

export default class MixerTrackNew extends Component {
  render() {
    return (
      <div className="mixer-track-new-wrapper">
        <div className="mixer-track-new" onClick={this.props.handleClickNew}>
          <div className="mixer-track-new-body">
            <span className="fa fa-plus-circle" />
            <span> Add MIDI Track</span>
          </div>
        </div>
      </div>
    )
  }
}

MixerTrackNew.propTypes = {
  handleClickNew: React.PropTypes.func.isRequired
}
