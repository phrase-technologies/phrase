import React from 'react'
import { connect } from 'react-redux'
import PhraseCard from 'components/PhraseCard.js'
import Helmet from "react-helmet"

export let Library = ({ phrases, dispatch }) => {
  let searchTerm = "Blah"

  return (
    <div className="library">
      {/*
      <div className="library-header page-header">
        <div className="container">
          <h1>
            <a>Home</a>
            &nbsp;
            <span className="fa fa-fw fa-caret-right" />
            <em>"{searchTerm}"</em>
          </h1>
        </div>
      </div>
      */}
      <div className="library-body">
        <div className="container library-body-container">

          <div className="library-selection-pane">
            <ul className="stories">
              {
                phrases.map((phrase) => {
                  return (
                    <PhraseCard
                      phrase={phrase}
                      plays={125}
                      likes={2}
                      comments={1}
                      key={phrase.id}
                    />
                  )
                })
              }
              <div className="library-selection-pane-end text-center">
                <span className="fa fa-anchor" style={{ color: '#CCC' }} />
              </div>
            </ul>
          </div>

          <div className="library-preview-pane">

            <br/>
            <br/>

            <h2>Choose a phrase on the left</h2>
            <p>
              Press
              <small style={{ fontSize: 10, padding: 2 }}>
                <span className="fa-stack fa-lg">
                  <i className="fa fa-square-o fa-stack-2x"></i>
                  <i className="fa fa-arrow-up fa-stack-1x"></i>
                </span>
              </small>
              or
              <small style={{ fontSize: 10, padding: 2 }}>
                <span className="fa-stack fa-lg">
                  <i className="fa fa-square-o fa-stack-2x"></i>
                  <i className="fa fa-arrow-down fa-stack-1x"></i>
                </span>
              </small>
              to cycle through them quickly
            </p>

          </div>

        </div>
      </div>
    </div>
  )
}

export default connect(state => state.library)(Library)
