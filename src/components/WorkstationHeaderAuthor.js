import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import { modalOpen } from 'reducers/reduceModal.js'
// import ansonImage from '../img/user/anson-kao.jpg'

export class WorkstationHeaderAuthor extends Component {
  render() {
    switch(this.props.authors.length) {
      default:
      case 2: return this.renderMultipleAuthors()
      case 1: return this.renderSingleAuthor()
      case 0: return this.renderNoAuthor()
    }
  }

  renderNoAuthor() {
    return (
      <a className="link-dark workstation-header-author" onClick={this.login}>
        <span style={{ paddingRight: 5 }}> by </span>
        <em> Unknown</em>
      </a>
    )
  }

  renderSingleAuthor() {
    let author = this.props.authors[0]
    let profileUri = `/user/${author.username}`

    return (
      <Link className="link-dark workstation-header-author" to={profileUri}>
        <span style={{ paddingRight: 5 }}> by </span>
        {/*<img className="workstation-header-profile-pic" src={author.image} />*/}
        <span> {author.username}</span>
        {/*<span className="caret" />*/}
      </Link>
    )
  }

  renderMultipleAuthors() {
    let authors = this.props.authors

    return (
      <a className="link-dark workstation-header-author" href="#">
        <span> by </span>
        { authors.map((author, id) => {
          return (
            <img className="workstation-header-profile-pic" src={author.image} key={id} />
          )
        })}
        {/*<span className="caret" />*/}
      </a>
    )
  }

  login = () => {
    this.props.dispatch(modalOpen({
      modalComponent: 'SignupModal',
    }))
  }
}

function mapStateToProps(state) {
  let authors = []

  // Existing Phrase
  if (state.phraseMeta.phraseId) {
    authors.push({ username: state.phraseMeta.authorUsername })
  }

  // New Phrase and Logged in
  else if (state.auth.user.username)
    authors.push({ username: state.auth.user.username })

  return {
    authors
  }
}

export default connect(mapStateToProps)(WorkstationHeaderAuthor)
