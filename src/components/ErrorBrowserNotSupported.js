import React from 'react'
import Helmet from "react-helmet"

export default () => {
  return (
    <div className="error-page error-browser-not-supported">
      <Helmet title="Browser Not Supported - Phrase.fm" />
      <div className="container">
        <div className="row">
          <div className="logo col-lg-6 col-lg-offset-3">
            <img src="/img/phrase-logo-white-text-2015-12-09.png" />
          </div>
        </div>
        <div className="row">
          <p>Sorry, Internet Explorer is not supported.</p>
          <p>Please use&nbsp;
            <a className="text-info" href="https://www.google.com/chrome/browser/desktop/index.html">
              Google Chrome
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
