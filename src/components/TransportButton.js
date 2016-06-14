import React from 'react'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'

import makeButtonUnfocusable from 'helpers/makeButtonUnfocusable'

export default (props) => {
  let colorClass = ` ${props.color ? `active-${props.color}` : ''}`
  let activeClass = ` ${props.toggle ? 'active' : ''}`
  let buttonClasses = 'btn btn-link btn-glow transport-btn' + activeClass + colorClass
  let iconClasses = `fa fa-fw fa-${props.type}`
  let buttonTooltip = <Tooltip id="tooltip-all-versions">{props.tooltip}</Tooltip>

  return (
    <OverlayTrigger placement="top" overlay={buttonTooltip} delay={640}>
      <button
        type="button" className={buttonClasses}
        onMouseDown={makeButtonUnfocusable}
        onClick={props.onButtonClick}
        tabIndex="-1"
      >
        <i className={iconClasses} />
      </button>
    </OverlayTrigger>
  )
}
