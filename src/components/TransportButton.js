import React from 'react'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'

import makeButtonUnfocusable from 'helpers/makeButtonUnfocusable'

export default (props) => {
  let colorClass = ` ${props.color ? `active-${props.color}` : ''}`
  let activeClass = ` ${props.toggle ? 'active' : ''}`
  let buttonLookClass = ` ${props.link ? 'btn-link btn-glow' : 'btn-dark'}`
  let injectedClass = ` ${props.className ? props.className : ''}`
  let buttonClasses = 'btn transport-btn' + buttonLookClass + activeClass + colorClass + injectedClass
  let buttonTooltip = <Tooltip id="tooltip-all-versions">{props.tooltip}</Tooltip>

  return (
    <OverlayTrigger placement="top" overlay={buttonTooltip} delay={640}>
      <button
        type="button" className={buttonClasses}
        {...makeButtonUnfocusable}
        onClick={props.onButtonClick}
        tabIndex="-1" disabled={props.disabled}
      >
        { props.children }
      </button>
    </OverlayTrigger>
  )
}
