import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import Numeral from 'numeral'

import { userProfile } from 'actions/actions'

import { api } from 'helpers/ajaxHelpers'

import LibraryPhrases from 'components/LibraryPhrases'
import UserProfilePic from 'components/UserProfilePic'

import { catchAndToastException } from 'reducers/reduceNotification'
import { userRequestProfileIfNotExisting } from 'reducers/reduceUserProfile'

export class UserProfile extends Component {

  state = {
    phrases: null,
    userId: null,
    isCurrentUser: this.props.routeParams.username !== localStorage.username,
  }

  componentWillMount() {
    this.loadUserPhrases()
    this.loadUser()
  }

  loadUser() {
    let { dispatch } = this.props
    if (this.state.isCurrentUser) {
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
    else {
      // The user is logged in, don't hit the api if we don't have to
      let userId = localStorage.userId
      this.setState({ userId })
      dispatch(userRequestProfileIfNotExisting({ userId }))
    }
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

  render() {
    let username = this.props.routeParams.username

    return (
      <div className="user-profile">
        <Helmet title={`${username} - Phrase.fm`} />
        <div className="user-profile-header page-header library-header">
          <div className="container">
            <UserProfilePic
              userId={this.state.userId}
              isCurrentUser={this.state.isCurrentUser}
            />
            <h1>
              {username}
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

  renderFollowerCount({ user }) {
    if (!user.followers)
      return null

    let followers = Numeral(user.followers).format('0,0[.][0]a')
    return (
      <span className="user-profile-action-count">{followers}</span>
    )
  }
}

export default connect(null)(UserProfile)
