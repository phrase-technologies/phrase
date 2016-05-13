import React from 'react'
import Numeral from 'numeral'
import Moment from 'moment'
import StoryUser from './StoryUser.js'
import { push } from 'react-router-redux'
import { phraseLoadFromMemory } from 'reducers/reducePhrase'

let PhraseCard = (props) => {
  let trackName = props.trackName
    ? (<span>{props.trackName} </span>)
    : (<em>Untitled phrase </em>)
  let numPlays      = Numeral(props.plays).format('0,0[.][0]')    + ((props.plays    === 1) ? ' play'    : ' plays')
  let numLikes      = Numeral(props.likes).format('0,0[.][0]')    + ((props.likes    === 1) ? ' like'    : ' likes')
  let numComments   = Numeral(props.comments).format('0,0[.][0]') + ((props.comments === 1) ? ' comment' : ' comments')
  let timestamp = Moment(props.timestamp).fromNow()

  let handleClick = (e) => {
    props.dispatch(phraseLoadFromMemory(props.phrase.state))
    props.dispatch(push(`/phrase/${phrase.username}/${phrase.id}`))
  }

  return (
    <div className="story-phrase">
      {/*
      <div className="story-phrase-transport">
        <button className="btn btn-dark story-phrase-play" onClick={handleClick}>
          <span className="fa fa-fw fa-pencil-square-o" />
        </button>
      </div>
      */}
      <div className="story-phrase-info">
        <h3 className="story-track-name">
          {trackName}
          {/*
          <a className="btn btn-bright btn-xs story-phrase-rephrase">
            <span className="fa fa-pencil-square-o" />
            <span> Rephrase this</span>
          </a>
          */}
        </h3>
        <div className="story-contributors">
          <span className="story-contributors-address">By </span>
          <StoryUser
            userPhoto={props.userPhoto}
            userName={props.username}
          />
          <span className="separator-bullet"> &bull; </span>
          <span className="story-user-timestamp">{timestamp.toString()}</span>
        </div>
        {/*
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
        <div className="story-phrase-tags">
          <a className="story-tag">HipHop</a>
          <a className="story-tag">Instrumental</a>
          <a className="story-tag">8bit</a>
        </div>
        */}
      </div>
    </div>
  )
}

export default PhraseCard
