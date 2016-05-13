import React from 'react'
import Helmet from "react-helmet"

export default () => {
  return (
    <div className="error-404">
      <Helmet title="Page not found, yo!" />
      <div className="error-404-header page-header">
        <div className="container">
          <h1>Page not found, yo!</h1>
        </div>
      </div>
      <div className="error-404-body">
        <div className="container library-body-container">
          <img src="" />
        </div>
      </div>
    </div>
  )
}
