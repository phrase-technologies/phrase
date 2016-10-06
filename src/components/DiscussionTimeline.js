import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import withSocket from 'components/withSocket'
import _ from 'lodash'

import DiscussionTimelineItem from 'components/DiscussionTimelineItem'
import {
  commentReceive,
  commentLoadExisting,
  commentClearExisting,
} from 'reducers/reduceComment'

export class DiscussionTimeline extends Component {

  list = {}

  render() {
    let [ replyComments, originalComments ] = _.partition(this.props.comments, comment => comment.parentId)

    return (
      <ul className="discussion-timeline">
        {
          // Loading status
          this.props.comments === null
          && <li className="discussion-timeline-notification">
            <span className="fa fa-spinner fa-pulse" />
            <span> Loading comments...</span>
          </li>
        }
        {
          // Timeline Empty
          this.props.comments !== null && this.props.comments.length === 0
          && <li className="discussion-timeline-notification">
            <span className="fa fa-comment fa-flip-horizontal" />
            <span> &nbsp; Be the first to leave a comment!</span>
          </li>
        }
        {
          // Timeline Has Content
          originalComments !== null &&
          originalComments.map((comment) => {
            let key = comment.id || comment.tempKey
            let currentReplies = replyComments.filter(reply => reply.parentId === comment.id)
            let selected = comment.id === this.props.selectedCommentId
            return (
              <DiscussionTimelineItem
                key={key} ref={ref => this.list[key] = ref}
                comment={comment} replies={currentReplies}
                setFullscreenReply={this.props.setFullscreenReply}
                selected={selected}
              />
            )
          })
        }
      </ul>
    )
  }

  componentWillMount() {
    if (this.props.phraseId) {
      this.props.dispatch(commentLoadExisting({ phraseId: this.props.phraseId }))
    } else {
      this.props.dispatch(commentClearExisting())
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.phraseId !== this.props.phraseId) {
      if (nextProps.phraseId) {
        this.props.dispatch(commentLoadExisting({ phraseId: nextProps.phraseId }))
      } else {
        this.props.dispatch(commentClearExisting())
      }
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
      let newComments = _.difference(this.props.comments, prevProps.comments)
      let newComment = newComments.length ? newComments[0] : null
      if (newComment && !newComment.id && !newComment.parentId) {
        let element = ReactDOM.findDOMNode(this.list[newComment.tempKey])
        this.props.scrollTimeline(element.offsetTop)
      }
    }
  }

}

export default withSocket(connect((state) => ({
  phraseId: state.phraseMeta.phraseId,
  author: state.phraseMeta.userId,
  comments: state.comment.comments,
  selectedCommentId: state.comment.commentId,
}))(DiscussionTimeline))
