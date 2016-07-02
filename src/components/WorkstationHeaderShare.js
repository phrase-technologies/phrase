import React from 'react'

import makeButtonUnfocusable from 'helpers/makeButtonUnfocusable'

export default () => {
  return (
    <div className="btn-group">
      <button
        className="btn btn-sm btn-dark btn-narrow btn-facebook"
        disabled {...makeButtonUnfocusable}
      >
        <span className="fa fa-fw fa-facebook" />
      </button>
      <button
        className="btn btn-sm btn-dark btn-narrow btn-twitter"
        disabled {...makeButtonUnfocusable}
      >
        <span className="fa fa-fw fa-twitter" />
      </button>
      <button
        className="btn btn-sm btn-dark"
        disabled {...makeButtonUnfocusable}
      >
        <span className="fa fa-paperclip" />
        <span> Link</span>
      </button>
    </div>
  )
}
