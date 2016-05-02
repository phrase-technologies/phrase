import React, { Component } from 'react'
import ansonImage from '../img/user/anson-kao.jpg'
import deadmau5Image from '../img/user/deadmau5.jpg'

export default class WorkstationHeaderAuthor extends Component {
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
      <a className="link-dark workstation-header-author" href="#">
        <span className="text-warning"> ... </span>
        <span className="fa fa-warning text-warning" />
        <span className="text-warning"> Unsaved</span>
      </a>
    )
  }

  renderSingleAuthor() {
    let author = this.props.authors[0]

    return (
      <a className="link-dark workstation-header-author" href="#">
        <span> by </span>
        <img className="workstation-header-profile-pic" src={author.image} />
        <span> {author.username}</span>
        {/*<span className="caret" />*/}
      </a>
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
}

WorkstationHeaderAuthor.defaultProps = {
  authors: [
    // {
    //   username: "anson_kao",
    //   image: ansonImage,
    // },
    {
      username: "deadmau5",
      image: deadmau5Image,
    },
  ]
}
