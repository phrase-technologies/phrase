import React, { Component } from 'react'

export default class UserBubble extends Component {

  render() {
    return (
      <div className="user-bubble">
        { this.props.online && <div className="signal signal-green" /> }
        { this.props.initials }
      </div>
    )
  }

}
