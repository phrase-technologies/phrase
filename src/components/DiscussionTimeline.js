import React, { Component } from 'react'
import { connect } from 'react-redux'
import withSocket from 'components/withSocket'

import DiscussionTimelineItem from 'components/DiscussionTimelineItem'
import { commentCreate } from 'reducers/reduceComment'

export class DiscussionTimeline extends Component {

  render() {
    return (
      <ul className="discussion-timeline">
        {
          this.props.comments.map((comment) => {
            return (
              <DiscussionTimelineItem
                key={comment.id}
                tick={ "4.1.1" }
                user={{ initials: "ZZ", username: "zavoshz" }}
                timestamp={"11:32 AM"}
                comment={comment.comment}
                setFullscreenReply={this.props.setFullscreenReply}
              />
            )
          })
        }
      </ul>
    )
  }

  componentDidMount() {
    let socket = this.props.socket

    // Subscribe to socket updates for the lifetime of the component
    socket.on(`server::commentsChangeFeed`, ({ action, state }) => {
      switch(action) {
        case "insert":
          this.props.dispatch(commentCreate(state))
          break
        case "delete":
        case "update":
        default:
          break
      }
    })
  }

}

export default withSocket(connect((state) => ({
  comments: state.comment.comments,
}))(DiscussionTimeline))
