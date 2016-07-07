import React from 'react'
import { connect } from 'react-redux'

let MouseTooltip = ({ x, y, tooltip }) =>
  <div
    style={{
      position: `absolute`,
      top: y - 20,
      left: x - 72,
      zIndex: tooltip ? 1 : -1,
      fontSize: `1rem`,
      background: `rgba(35, 35, 35, 0.8)`,
      border: `1px solid rgb(113, 113, 113)`,
      color: `white`,
      padding: `0.5rem`,
    }}
  >
    { (tooltip || {}).text }
  </div>

export default connect(state => state.mouse)(MouseTooltip)
