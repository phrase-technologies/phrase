import React from 'react'
import {  Route, IndexRoute } from 'react-router'

import Site from 'components/Site.js'
import App from 'components/App.js'
import LandingPage from 'components/LandingPage.js'
import Workstation from 'components/Workstation.js'
import Library from 'components/Library.js'
import UserProfile from 'components/UserProfile.js'
import About from 'components/About.js'
import NewPassword from 'components/NewPassword.js'
import Error404 from 'components/Error404.js'
import ConfirmUser from 'components/ConfirmUser'
import OAuthCallback from 'components/OAuthCallback'

export default (
  <Route path="/" component={Site}>
    <IndexRoute component={LandingPage} hideHeader={true} />
    <Route path="about" component={About} />
    <Route path="developers" component={About} />
    <Route path="new-password" component={NewPassword} />
    <Route path="confirm-user" component={ConfirmUser} />
    <Route path="oauth-callback" component={OAuthCallback} />
    <Route path="/" component={App}>
      <Route path="search" component={Library} />
      <Route path="search/:searchTerm" component={Library} />
      <Route path="user/:username" component={UserProfile} />
      <Route path="phrase/new" component={Workstation} maximize={true} />
      <Route path="phrase/:username/:phraseId" component={Workstation} maximize={true} />
      <Route path="phrase/:username/:phraseId/:phrasename" component={Workstation} />
    </Route>
    <Route path="*" component={Error404} />
  </Route>
)
