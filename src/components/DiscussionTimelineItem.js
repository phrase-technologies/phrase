import React, { Component } from 'react'
import DiscussionUser from 'components/DiscussionUser'

export default class DiscussionTimelineItem extends Component {

  render() {
    return (
      <li className="discussion-timeline-item">
        <div className="discussion-timeline-tick">
          { this.props.tick }
        </div>
        <div className="discussion-timeline-meta">
          <DiscussionUser>
            { this.props.user.initials }
          </DiscussionUser>
          <span className="discussion-timeline-username">
            { this.props.user.username }
          </span>
          <span className="discussion-timeline-timestamp">
            { this.props.timestamp }
          </span>
        </div>
        <div className="discussion-timeline-content enable-select">
          { this.props.comment }
        </div>
        <div className="discussion-timeline-reply">
          <a>Reply</a>
        </div>
      </li>
    )
  }

}
