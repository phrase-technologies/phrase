import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import { modalOpen } from 'reducers/reduceModal.js'
import ansonImage from '../img/user/anson-kao.jpg'
import deadmau5Image from '../img/user/deadmau5.jpg'

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
        <em> by Unknown</em>
      </a>
    )
  }

  renderSingleAuthor() {
    let author = this.props.authors[0]
    let profileUri = `/user/${author.username}`

    return (
      <Link className="link-dark workstation-header-author" to={profileUri}>
        <span> by </span>
        <img className="workstation-header-profile-pic" src={author.image} />
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

WorkstationHeaderAuthor.defaultProps = {
  authors: [
    {
      username: "anson_kao",
      image: ansonImage,
    },
    // {
    //   username: "deadmau5",
    //   image: deadmau5Image,
    // },
  ]
}

export default connect()(WorkstationHeaderAuthor)
