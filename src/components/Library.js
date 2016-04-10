import React from 'react'

export default () => {
  return (
    <div className="library">
      <div className="library-browser">
        <div className="library-browser-intro">
          {/*
          <h1>Get Inspired Now</h1>
          */}
          <h2>Find New Sounds</h2>
          <h3>
            <span>Produce Music </span>
            <span>Instantly</span>
          </h3>
        </div>
        <br/>
        <input type="text" placeholder="Search for Sounds" />
      </div>
      <div className="library-preview">
        Preview
      </div>
      <div className="library-project">
        <h1>Untitled Project</h1>
      </div>
    </div>
  )
}
