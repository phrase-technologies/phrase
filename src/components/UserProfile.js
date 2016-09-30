import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import Numeral from 'numeral'

import { userProfile } from 'actions/actions'

import { api } from 'helpers/ajaxHelpers'
import { defaultPic } from 'helpers/authHelpers'

import LibraryPhrases from 'components/LibraryPhrases'

import { modalOpen } from 'reducers/reduceModal'
import { catchAndToastException } from 'reducers/reduceNotification'

export class UserProfile extends Component {

  state = {
    phrases: null,
    userId: null,
    isOwner: this.props.routeParams.username === localStorage.username,
  }

  componentWillMount() {
    this.loadUserPhrases()
    this.loadUser()
  }

  loadUser() {
    let { dispatch } = this.props
    catchAndToastException({ dispatch, toCatch: async () => {
      let { loadedUser } = await api({
        endpoint: `loadUserByUsername`,
        body: { theUsername: this.props.routeParams.username }
      })
      if (loadedUser) {
        this.setState({ userId: loadedUser.id })
        dispatch({ type: userProfile.RECEIVE_USER, payload: loadedUser })
      }
    }})
  }

  loadUserPhrases() {
    let { dispatch } = this.props
    catchAndToastException({ dispatch, toCatch: async() => {
      let { phrases } = await api({
        endpoint: `loadUserPhrases`,
        body: { username: this.props.routeParams.username },
      })
      if (phrases) this.setState({ phrases })
    }})
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.routeParams.username !== this.props.routeParams.username) {
      this.setState({ phrases: null })
      // Wait till next tick for props.routeParams to update before kicking off update
      setTimeout(() => this.loadUserPhrases())
    }
  }

  openPhotoUpload = (e) => {
    e.preventDefault()
    if (this.state.isOwner)
      this.props.dispatch(modalOpen({ modalComponent: `UploadPhotoModal` }))
  }

  render() {
    let image = null
    let userId = this.state.userId
    if (userId) {
      let u = this.props.users[userId]
      if (u && !u.pending)
        image = u.picture ? u.picture : defaultPic
    }
    let user = {
      username: this.props.routeParams.username,
      image,
      //followers: 28751,
      //verified: true,
    }
    let ownerStyle = this.state.isOwner ? `user-profile-pic-owner` : ``

    return (
      <div className="user-profile">
        <Helmet title={`${user.username} - Phrase.fm`} />
        <div className="user-profile-header page-header library-header">
          <div className="container">
            <div className={`user-profile-pic ${ownerStyle}`} onClick={this.openPhotoUpload}>
              <img src={user.image} />
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
            </div>
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

export default connect(state => ({ users: state.userProfile.users }))(UserProfile)
