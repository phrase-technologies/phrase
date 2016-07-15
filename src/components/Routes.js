import React from 'react'
import {  Route, IndexRedirect } from 'react-router'

import App from 'components/App.js'
import Workstation from 'components/Workstation.js'
import Library from 'components/Library.js'
import UserProfile from 'components/UserProfile.js'
import About from 'components/About.js'
import NewPassword from 'components/NewPassword.js'
import Error404 from 'components/Error404.js'

export default (
  <Route path="/" component={App}>
    <IndexRedirect to="/phrase/new" />
    <Route path="/search" component={Library} />
    <Route path="/search/:searchTerm" component={Library} />
    <Route path="/user/:userId" component={UserProfile} />
    <Route path="/phrase/new" component={Workstation} maximize={true} />
    <Route path="/phrase/:username/:phraseId" component={Workstation} maximize={true} />
    <Route path="/phrase/:username/:phraseId/:phrasename" component={Workstation} />
    <Route path="/about" component={About} />
    <Route path="/developers" component={About} />
    <Route path="/new-password" component={NewPassword} />
    <Route path="*" component={Error404} />
  </Route>
)
