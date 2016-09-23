import React, { Component } from 'react'
import { connect } from 'react-redux'
import withSocket from 'components/withSocket'
import _ from 'lodash'

import DiscussionTimelineItem from 'components/DiscussionTimelineItem'
import { commentReceive } from 'reducers/reduceComment'

export class DiscussionTimeline extends Component {

  render() {
    return (
      <ul className="discussion-timeline">
        {
          this.props.comments.map((comment) => {
            console.log( this.props.collaborators )
            let user = this.props.collaborators.find(x => x.id === comment.authorId) || this.props.author
            return (
              <DiscussionTimelineItem
                key={comment.id || comment.tempKey}
                user={user}
                comment={comment}
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
          this.props.dispatch(commentReceive(state))
          break
        // TODO, for when we add the ability to delete or edit existing comments
        case "delete":
        case "update":
        default:
          break
      }
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.comments.length !== this.props.comments.length) {
      let newComment = _.difference(this.props, prevProps)
      if (!newComment.id) {

      }
    }
  }

}

export default withSocket(connect((state) => ({
  author: state.phraseMeta.userId,
  collaborators: state.phraseMeta.collaborators,
  comments: state.comment.comments,
}))(DiscussionTimeline))
