import React, { Component } from 'react'
import withSocket from 'components/withSocket'

import DiscussionTimelineItem from 'components/DiscussionTimelineItem'

export class DiscussionTimeline extends Component {

  render() {
    return (
      <ul className="discussion-timeline">
        {
          (
          <DiscussionTimelineItem
            tick={ "4.1.1" }
            user={{ initials: "ZZ", username: "zavoshz" }}
            timestamp={"11:32 AM"}
            comment="You've built a nice full-screen mobile webapp, complete with scrollable elements using the -webkit-overflow-scrolling property. Everything is great, however, when you scroll to the top or bottom of your scrollable element, the window exhibits rubber band-like behavior, revealing a gray tweed pattern. Sometimes, your scrollable element doesn't scroll at all, but the window still insists on bouncing around."
            setFullscreenReply={this.props.setFullscreenReply}
          />
          )
        }
      </ul>
    )
  }

  componentDidMount() {
    let socket = this.props.socket

    // Subscribe to socket updates for the lifetime of the component
    socket.on(`server::commentsChangeFeed`, ({ action, state }) => {
      console.log( "A", action, state )
      switch(action) {
        case "insert":
          console.log( "B", action, state )
          break
        case "delete":
        case "update":
        default:
          break
      }
    })
  }

}

export default withSocket(DiscussionTimeline)
