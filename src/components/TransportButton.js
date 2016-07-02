import React from 'react'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'

import makeButtonUnfocusable from 'helpers/makeButtonUnfocusable'

export default (props) => {
  let colorClass = ` ${props.color ? `active-${props.color}` : ''}`
  let activeClass = ` ${props.toggle ? 'active' : ''}`
  let narrowClass = ` ${props.narrow ? 'btn-narrow' : 'transport-btn'}`
  let buttonClasses = 'btn btn-link btn-glow' + activeClass + colorClass + narrowClass
  let buttonTooltip = <Tooltip id="tooltip-all-versions">{props.tooltip}</Tooltip>

  return (
    <OverlayTrigger placement="top" overlay={buttonTooltip} delay={640}>
      <button
        type="button" className={buttonClasses}
        {...makeButtonUnfocusable}
        onClick={props.onButtonClick}
        tabIndex="-1"
      >
        { props.children }
      </button>
    </OverlayTrigger>
  )
}
