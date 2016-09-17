import React, { Component } from 'react'

export default class UserBubble extends Component {

  render() {
    return (
      <div className="user-bubble">
        { this.props.children }
      </div>
    )
  }

}
