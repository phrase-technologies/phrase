import React, { Component } from 'react'

export default class DiscussionUser extends Component {

  render() {
    return (
      <div className="discussion-user">
        { this.props.children }
      </div>
    )
  }

}
