import React from 'react'
import { connect } from 'react-redux'
import Helmet from "react-helmet"

import * as AllModals from 'components/modals'
import MouseTooltip from 'components/MouseTooltip'
import ToastNotificationStack from 'components/ToastNotificationStack'

export let Site = ({ activeModal, children, show }) => {

  let ActiveModal = activeModal ? AllModals[activeModal] : 'div'
  let faviconConfig = [{
    rel: "icon",
    href: require('../img/favicon.ico'),
    type: "img/ico",
  }]

  return (
    <div>
      <Helmet link={faviconConfig} />
      <div>
        { children }
      </div>
      <ActiveModal show={show} />
      <MouseTooltip />
      <ToastNotificationStack />
    </div>
  )
}

function mapStateToProps(state) {
  return {
    ...state.modal
  }
}
export default connect(mapStateToProps)(Site)
