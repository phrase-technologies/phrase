import React, { Component } from 'react'
import { connect } from 'react-redux'
import withSocket from 'components/withSocket'
import _ from 'lodash'

import DiscussionTimelineItem from 'components/DiscussionTimelineItem'
import {
  commentReceive,
  commentLoadAll,
} from 'reducers/reduceComment'

export class DiscussionTimeline extends Component {

  render() {
    return (
      <ul className="discussion-timeline">
        {
          // Loading status
          this.props.comments === null
          && <span>Loading comments...</span>
        }
        {
          // Timeline
          this.props.comments !== null && this.props.comments.map((comment) => {
            let user = this.props.users.find(x => x.id === comment.authorId)
            return (
              <DiscussionTimelineItem
                key={comment.id || comment.tempKey}
                user={user} comment={comment} dispatch={this.props.dispatch}
                setFullscreenReply={this.props.setFullscreenReply}
              />
            )
          })
        }
      </ul>
    )
  }

  componentWillMount() {
    if (this.props.phraseId) {
      this.props.dispatch(commentLoadAll({ phraseId: this.props.phraseId }))
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.phraseId !== this.props.phraseId && nextProps.phraseId) {
      this.props.dispatch(commentLoadAll({ phraseId: nextProps.phraseId }))
    }
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
    // Nothing to check if we are in a loading state
    if (prevProps.comments === null || this.props.comments === null)
      return

    // Scroll to any newly just submitted comment!
    if (prevProps.comments.length !== this.props.comments.length) {
      let newComment = _.difference(this.props, prevProps)
      if (!newComment.id) {

      }
    }
  }

}

export default withSocket(connect((state) => ({
  phraseId: state.phraseMeta.phraseId,
  author: state.phraseMeta.userId,
  users: state.userProfile.users,
  comments: state.comment.comments,
}))(DiscussionTimeline))
