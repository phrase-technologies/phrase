import React from 'react'
import Helmet from "react-helmet"
import { Link } from 'react-router'

export default () => {

  return (
    <div className="landing-page">
      <Helmet title="Phrase.fm - Create Music Online. Instantly." />

      <nav className="landing-page-header">
        <ul className="landing-page-header-menu">
          <li>
            <Link to="/phrase/new">
              <span className="fa fa-sign-in" /><span> Login</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="container-fluid">

        <div className="section-landing row">
          <div className="col-sm-12 section-landing-header">
            <img className="section-landing-header-logo" src={require('../img/phrase-logo-white-text-2015-12-09.png')} />
          </div>
          <div className="col-sm-6 section-landing-treatment">
            <div className="section-landing-flex">
              <h1 style={{ marginTop: 0 }}>
                <span>Create Music Online. </span>
                <strong>Instantly.</strong>
              </h1>
              <p className="section-landing-text">
                Phrase is a songwriting platform that loads right in your browser.
                Just open a new phrase, and instantly start creating.
                No download, no installation - just you and your
                unbounded creativity.
              </p>
              <p className="section-landing-text">
                <a className="btn btn-lg btn-aqua" style={{ marginTop: 10 }} href="#signup">
                  GET YOUR INVITE
                </a>
              </p>
            </div>
          </div>
          <span className="scroll-indicator-text">Learn More</span>
          <span className="scroll-indicator caret"></span>
          <div className="col-sm-6 section-landing-visual">
            <div className="section-landing-flex">
              <img className="section-landing-image" src={require('../img/macbook-phrase.png')} />
            </div>
          </div>
        </div>

      </div>
      <div className="container-no-gutters">

        <div className="section-features row no-gutters">
          <div className="col-sm-6">
            <div className="section-features-text-left">
              <div className="section-features-flex">
                <h2>Click. Type. Perform. Record.</h2>
                <p className="section-features-text">
                  Input your musical ideas into our world-class
                  pianoroll interface via any method you prefer,
                  including mouse, computer keyboard, and MIDI controller.
                </p>
                <p className="section-features-text">
                  <small>Microphone support coming soon.</small>
                </p>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="section-features-image-right" style={{ justifyContent: 'flex-end', textAlign: 'right' }}>
              <div className="section-features-flex">
                <img className="section-features-image" src={require('../img/pianoroll.png')} />
              </div>
            </div>
          </div>
        </div>

        <div className="section-features row no-gutters">
          <div className="col-sm-6 col-sm-push-6">
            <div className="section-features-text-left">
              <div className="section-features-flex">
                <h2 style={{ marginTop: 0 }}>Plug-and-play MIDI support</h2>
                <p className="section-features-text">
                  Yep. Plug in your external MIDI controller and start
                  playing instantly. No extra installation CD or drivers;
                  just you, your keyboard, and limitless possibilities.
                </p>
                <p className="section-features-text">
                  <small>Note: Google Chrome browser is required.</small>
                </p>
                <p className="section-features-text" style={{ marginBottom: 30 }}>
                  <a className="btn btn-default" href="https://www.google.com/chrome/browser/" target="_blank">
                    <img src={require('../img/google-chrome.png')} style={{ width: 50, margin: '-20px 5px -20px -5px' }} />
                    Download Chrome
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-sm-pull-6">
            <div className="section-features-image-right" style={{ justifyContent: 'flex-end', textAlign: 'left' }}>
              <div className="section-features-flex">
                <img className="section-features-image" src={require('../img/input-methods.jpg')} />
              </div>
            </div>
          </div>
        </div>

        <div className="section-features row no-gutters">
          <div className="col-sm-12">
            <div className="section-features-text-center">
              <h2>Your session is universally accessible to collaborators in the cloud</h2>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="section-features-text-left">
              <div className="section-features-flex">
                <p className="section-features-text">
                  Because Phrase is a website, each of your sessions gets it‘s
                  own unique URL that can be shared with collaborators or fans.
                  No more sending files or taking silly videos of your in-progress
                  session. Simply share the link, and your entire session is shared.
                </p>
              </div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="section-features-image-centre" style={{ justifyContent: 'center', textAlign: 'center' }}>
              <div className="section-features-flex" style={{ width: '90%', margin: '20px auto 0' }}>
                <img className="section-features-image" src={require('../img/cloud-collaboration.jpg')} />
              </div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="section-features-text-right">
              <div className="section-features-flex">
                <p className="section-features-text">
                  We also automatically save and backup all of your changes to
                  the cloud, so you are protected from accidents or theft.
                  With Phrase, you can spend less time worrying,
                  and more time creating.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-features row no-gutters">
          <div className="col-sm-6 col-sm-push-6">
            <div className="section-features-text-left">
              <div className="section-features-flex">
                <h2 style={{ marginTop: 0 }}>Built-in, Beautiful Sounds</h2>
                <p className="section-features-text" style={{ marginBottom: 30 }}>
                  We‘re working closely with our partners to deliver only the
                  best, uncompromising instruments and sounds. And remember -
                  thanks to Phrase being in the cloud, you never have to worry
                  again about taking files with you or synchronizing with
                  collaborators. Your instruments and sounds follow your session
                  wherever it goes on the world wide web.
                </p>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-sm-pull-6">
            <div className="section-features-image-right" style={{ justifyContent: 'flex-end', textAlign: 'left' }}>
              <div className="section-features-flex" style={{ width: '90%', margin: '0 auto' }}>
                <img className="section-features-image" src={require('../img/grand-piano.jpg')} />
              </div>
            </div>
          </div>
        </div>

      </div>
      <div className="section-signup" id="signup">

        <iframe className="typeform-widget" src="https://phrase.typeform.com/to/Posk8t" />

      </div>

    </div>
  )

}
