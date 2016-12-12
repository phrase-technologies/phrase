import React, { Component } from 'react'
import Numeral from 'numeral'
import StoryUser from './StoryUser.js'

export default class StoryTrack extends Component {

  getContributors() {
    var contributorAddress = (this.props.contributors.length > 1)
                           ? this.props.contributors.length+' contributors: '
                           : 'By '
    var contributors = []
        contributors.push(<span className="story-contributors-address" key="address">{contributorAddress}</span>)

    for(var i in this.props.contributors )
    {
      if( i > 0 )
        contributors.push(<span key={(i-1)+'-comma'}>, </span>)

      contributors.push(
        <StoryUser
          userPhoto={this.props.contributors[i].userPhoto}
          userName={this.props.contributors[i].userName}
          mode="text"
          key={i}
        />
      )
    }

    return contributors
  }

  render() {
    var contributors  = this.getContributors()
    var numPlays      = Numeral(this.props.plays).format('0,0[.][0]')    + ( (this.props.plays    == 1) ? ' play'    : ' plays'    )
    var numLikes      = Numeral(this.props.likes).format('0,0[.][0]')    + ( (this.props.likes    == 1) ? ' like'    : ' likes'    )
    var numComments   = Numeral(this.props.comments).format('0,0[.][0]') + ( (this.props.comments == 1) ? ' comment' : ' comments' )

    return (
      <div className="story-track">
        <img className="story-track-cover" src={this.props.trackCover} />
        <h3 className="story-track-name">{this.props.trackName}</h3>
        <div className="story-contributors">
          {contributors}
        </div>
        <div className="story-stats">
          <span className="story-stats-plays">
            <span className="fa fa-play" />
            <span> {numPlays} </span>
          </span>
          <span className="story-stats-likes">
            <span className="fa fa-heart" />
            <span> {numLikes} </span>
          </span>
          <span className="story-stats-comments">
            <span className="fa fa-comment fa-flip-horizontal" />
            <span> {numComments} </span>
          </span>
        </div>
      </div>
    )
  }
}

StoryTrack.propTypes = {
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
