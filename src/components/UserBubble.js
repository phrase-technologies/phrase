import React, { Component } from 'react'

export default class UserBubble extends Component {

  render() {
    return (
      <div
        className={`user-bubble ${this.props.type || ''}`}
        onClick={this.props.handleClick}
      >
        { this.props.loadingMasterControl &&
          <i className="master-control-loading fa fa-spinner fa-spin" />}
        { this.props.masterControl &&
          !this.props.loadingMasterControl &&
          <i className="master-control-icon fa fa-bolt" />
        }
        { this.props.online && <div className="signal signal-green" /> }
        { this.props.initials }
      </div>
    )
  }

}
