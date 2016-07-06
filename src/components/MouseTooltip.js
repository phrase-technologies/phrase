import React from 'react'
import { connect } from 'react-redux'

let MouseTooltip = ({ x, y, children }) =>
  <div
    style={{
      position: `absolute`,
      top: y - 20,
      left: x - 100,
      zIndex: 1,
      fontSize: `1rem`,
      background: `rgba(35, 35, 35, 0.8)`,
      border: `1px solid rgb(113, 113, 113)`,
      color: `white`,
      padding: `0.5rem`,
    }}
  >
    { children }
  </div>

export default connect(state => state.mouse)(MouseTooltip)
