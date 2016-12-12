import React, { Component } from 'react'

export default class NewRibbon extends Component {
  render() {
    return (
      <div className="mixer-track-new-wrapper">
        <div
          className="mixer-track-new"
          onClick={this.props.handleClick}
          onWheel={this.handleScrollWheel}
        >
          <div className="mixer-track-new-body">
            <span className="fa fa-plus-circle" />
            <span>{this.props.text}</span>
          </div>
        </div>
      </div>
    )
  }
}

NewRibbon.propTypes = {
  handleClick: React.PropTypes.func.isRequired
}
