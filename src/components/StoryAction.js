import React, { Component } from 'react'
import Moment from 'moment-twitter'
import StoryUser from './StoryUser.js'

export default class StoryAction extends Component {
  render() {
    var timestamp = Moment(this.props.timestamp).twitterLong()

    return (
      <div className="story-action">
        <StoryUser
          userPhoto={this.props.userPhoto}
          userName={this.props.userName}
        />
        <span className="story-user-action"> {this.props.action} this </span>
        <span className="separator-bullet"> &bull; </span>
        <a className="story-user-timestamp"> {timestamp.toString()}</a>
      </div>      
    )
  }
}

StoryAction.propTypes = {
  userPhoto:    React.PropTypes.string.isRequired,
  userName:     React.PropTypes.string.isRequired,
  action:       React.PropTypes.string.isRequired,
  timestamp:    React.PropTypes.instanceOf(Date).isRequired
}
