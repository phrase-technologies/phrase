import React from 'react'
import { connect } from 'react-redux'

import Header from 'components/Header.js'
import Library from 'components/Library.js'
import Workstation from 'components/Workstation.js'

import LoginModal from 'components/modals/LoginModal.js'
import SignupModal from 'components/modals/SignupModal.js'
export const AllModals = {
  LoginModal,
  SignupModal,
}

export let App = (props) => {
  let ActiveModal = props.activeModal ? AllModals[props.activeModal] : 'div'
  let maximized = (props.route.path === '/edit')

  return (
    <div>
      <Header />
      <Library />
      <Workstation maximized={maximized} />
      <ActiveModal show={props.show} />
    </div>
  )
}

function mapStateToProps(state) {
  return {
    ...state.modal
  }
}
export default connect(mapStateToProps)(App)
