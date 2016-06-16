import React from 'react'
import Helmet from "react-helmet"

export default () => {
  return (
    <div className="about">
      <Helmet title={`About - Phrase.fm`} />
      <div className="about-header page-header">
        <div className="container">
          <h1>About</h1>
        </div>
      </div>
      <div className="container">

        <p>
          We're a nimble team of software engineers with a passion for
          music Post-production.
        </p>

        <p>
          We're a nimble team of software engineers with a passion for
          music Post-production.
        </p>

      </div>
    </div>
  )
}
