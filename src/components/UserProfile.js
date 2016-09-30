import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import Numeral from 'numeral'

import { api } from 'helpers/ajaxHelpers'
import { defaultPic } from 'helpers/authHelpers'
import { catchAndToastException } from 'reducers/reduceNotification'
import LibraryPhrases from 'components/LibraryPhrases'

export class UserProfile extends Component {

  state = {
    phrases: null,
    userPicture: null,
  }

  loadUserPhrases() {
    let { dispatch } = this.props
    catchAndToastException({ dispatch, toCatch: async() => {
      let { phrases, picture: userPicture } = await api({
        endpoint: `loadUserPhrases`,
        body: { username: this.props.routeParams.username },
      })
      if (userPicture) this.setState({ userPicture })
      else this.setState({ userPicture: defaultPic })
      if (phrases) this.setState({ phrases })
    }})
  }

  componentDidMount() {
    this.loadUserPhrases()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.routeParams.username !== this.props.routeParams.username) {
      this.setState({ phrases: null })
      // Wait till next tick for props.routeParams to update before kicking off update
      setTimeout(() => this.loadUserPhrases())
    }
  }

  render() {
    let username = this.props.routeParams.username
    let isCurrentUser = username === localStorage.username
    let user = {
      username,
      // image: (username === localStorage.username) ? this.props.userPicture : this.state.userPicture,
      // followers: 28751,
      // verified: true,
    }

    return (
      <div className="user-profile">
        <Helmet title={`${user.username} - Phrase.fm`} />
        <div className="user-profile-header page-header library-header">
          <div className="container">
            <label className="user-profile-pic" htmlFor="upload-input" style={{ cursor: isCurrentUser ? 'pointer' : 'default' }}>
              { (user.image && <img src={user.image} />)
                || <span className="user-profile-initials">{ user.username.substring(0, 2).toUpperCase() }</span>
              }
              { this.renderVerified({ user }) }
              {
                isCurrentUser && (
                  <div className="user-profile-upload">
                    <span className="fa fa-camera" />
                    <span> Upload</span>
                    <input id="upload-input" type="file" style={{ display: 'none' }} />
                  </div>
                )
              }
            </label>
            <h1>
              {user.username}
            </h1>
            {/*
            <div>
              <button className="btn btn-bright btn-light-bg user-profile-action">
                <span>Follow</span>
                { this.renderFollowerCount({ user }) }
              </button>
            </div>
            */}
          </div>
        </div>
        <div className="library">
          <LibraryPhrases phrases={this.state.phrases} />
        </div>
      </div>
    )
  }

  renderVerified({ user }) {
    if (!user.verified)
      return null

    return (
      <span className="fa fa-check user-profile-pic-verified" />
    )
  }

  renderFollowerCount({ user }) {
    if (!user.followers)
      return null

    let followers = Numeral(user.followers).format('0,0[.][0]a')
    return (
      <span className="user-profile-action-count">{followers}</span>
    )
  }
}

export default connect(() => { return { userPicture: localStorage.picture }})(UserProfile)
