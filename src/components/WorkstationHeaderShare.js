import React from 'react'

export default () => {
  return (
    <div className="btn-group">
      <button className="btn btn-dark btn-narrow btn-facebook" disabled>
        <span className="fa fa-fw fa-facebook" />
      </button>
      <button className="btn btn-dark btn-narrow btn-twitter" disabled>
        <span className="fa fa-fw fa-twitter" />
      </button>
      <button className="btn btn-dark" disabled>
        <span className="fa fa-paperclip" />
        <span> Link</span>
      </button>
    </div>
  )
}
