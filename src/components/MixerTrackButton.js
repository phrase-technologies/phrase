import React from 'react'
import { Tooltip, OverlayTrigger } from 'react-bootstrap'

import makeButtonUnfocusable from 'helpers/makeButtonUnfocusable'

export default ({ active, buttonClasses, action, trackID, tooltip, children, ...props }) => {

  buttonClasses = 'mixer-track-btn ' + buttonClasses
  buttonClasses += active ? ' active' : ''

  let buttonTooltip = <Tooltip id={`tooltip-arm-${trackID}`} >{tooltip}</Tooltip>

  return (
    <OverlayTrigger placement="top" overlay={buttonTooltip} delayShow={640}>
      <button
        className={buttonClasses} {...props}
        onClick={action} onMouseDown={makeButtonUnfocusable}
      >
        {children}
      </button>
    </OverlayTrigger>
  )

}
