import React, { Component } from 'react'
import TextareaAuto from 'react-textarea-autosize'
import DiscussionUser from 'components/DiscussionUser'

export default class DiscussionTimelineItem extends Component {

  constructor() {
    super()
    this.state = {
      replying: false,
    }
  }

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
        <div className="discussion-timeline-actions">
          <a>
            Like
          </a>
          <span> &middot; </span>
          <a onClick={this.openReply}>
            Reply
          </a>

          { this.renderReply() }
        </div>
      </li>
    )
  }

  renderReply() {
    if (this.state.replying) {
      return (
        <TextareaAuto
          className="discussion-timeline-reply form-control form-control-dark"
          placeholder="Write a reply..."
          ref={ref => this.textarea = ref}
        />
      )
    }

    return null
  }

  openReply = () => {
    this.setState({ replying: true })
  }

  componentDidUpdate() {
    // Focus the textarea if opened!
    if (this.state.replying) {
      this.textarea.focus()
    }
  }

}
