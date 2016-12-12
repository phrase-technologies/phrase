import React, { Component } from 'react'
import StoryAction from './StoryAction.js'
import StoryTrack from './StoryTrack.js'
import StoryActivityPreview from './StoryActivityPreview.js'

export default class Story extends Component {

  getClasses() {
    return this.props.action ? 'story story-with-action' : 'story'
  }

  getAction() {
    return this.props.action ? (
      <StoryAction 
        userPhoto={this.props.userPhoto}
        userName={this.props.userName}
        action={this.props.action}
        timestamp={this.props.timestamp}
      />
    ) : null
  }

  render() {
    var storyClasses = this.getClasses()
    var action = this.getAction()

    return (
      <li className={storyClasses}>
        {action}
        <StoryTrack 
          trackCover={this.props.trackCover}
          trackName={this.props.trackName}
          contributors={this.props.contributors}
          plays={this.props.plays}
          likes={this.props.likes}
          comments={this.props.comments}
        />
        <StoryActivityPreview />
      </li>
    )
  }
}

Story.propTypes = {
  userPhoto:    React.PropTypes.string,
  userName:     React.PropTypes.string,
  action:       React.PropTypes.string,
  timestamp:    React.PropTypes.instanceOf(Date).isRequired,
  trackCover:   React.PropTypes.string.isRequired,
  trackName:    React.PropTypes.string.isRequired,
  contributors: React.PropTypes.arrayOf(
                  React.PropTypes.shape({
                    userPhoto:  React.PropTypes.string.isRequired,
                    userName:   React.PropTypes.string.isRequired
                  })
                ),
  plays:        React.PropTypes.number.isRequired,
  likes:        React.PropTypes.number.isRequired,
  comments:     React.PropTypes.number.isRequired
}
