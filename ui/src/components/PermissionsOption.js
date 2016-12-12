import React from 'react'

export default ({ option }) => {
  return (
    <div className="media" style={{ margin: 0 }}>
      <div className="media-left" style={{ paddingRight: 5 }}>
        <div className="media-object">
          <span className="fa-stack fa-lg">
            <span className="fa fa-circle-thin fa-stack-2x" />
            <span className={`fa fa-${option.icon} fa-stack-${option.iconSize}x`} />
          </span>
        </div>
      </div>
      <div className="media-body">
        <h4 className="media-heading" style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 2 }}>
          { option.title }
        </h4>
        <small>
          { option.description }
        </small>
      </div>
    </div>
  )
}
