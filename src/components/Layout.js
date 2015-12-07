import React, { Component } from 'react';
import { connect } from 'react-redux';
import PianoRoll from './PianoRoll.js';
import EffectsModule from './EffectsModule.js';
import EffectsCoupler from './EffectsCoupler.js';
import Stories from './Stories.js';
import LayoutPage from './LayoutPage.js';
import LayoutConsole from './LayoutConsole.js';
import { navConsoleToggle } from '../actions/actions.js';

export default class Layout extends Component {

  constructor() {
    super();
    this.state = {
      page: 'B'
    };

    this.handleToggleConsole = this.handleToggleConsole.bind(this);
  }

  handleToggleConsole() {
    this.props.dispatch(navConsoleToggle());
  }

  getCursorClass() {
    var resultClass = "";

    if( this.props.cursor.explicit )
      resultClass = "cursor-"+this.props.cursor.explicit;
    else if( this.props.cursor.implicit )
      resultClass = "cursor-"+this.props.cursor.implicit;

    return resultClass;
  }

  togglePage(page) {
    this.setState({page: page});
  }

  renderPageOverlay() {
    var pageOverlayClasses = this.props.navigation.console
                           ? 'layout-page-overlay'
                           : 'layout-page-overlay layout-overlay-hidden';
    return (
      <div className={pageOverlayClasses} onClick={this.handleToggleConsole} />
    );
  }

  render() {
    var hidden = {display: 'none'};
    var layoutClasses = ["layout", this.getCursorClass(), 'disable-select'];
        layoutClasses = layoutClasses.join(' ').trim();
    var logo = require('../img/phrase-logo-black-engraved-2015-10-26.png');  

    var pageA = (
      <div>
        <div className="layout-header" style={hidden}>
          <img src={logo} />
        </div>
        <div className="layout-session">
        </div>
        <div className="layout-track">
          <div className="layout-track-slider">
            <EffectsCoupler />
            <EffectsModule name="Clip Editor">
              <PianoRoll/>
            </EffectsModule>
            <EffectsCoupler />
            <EffectsModule name="Super Saw" />
            <EffectsCoupler />
            <EffectsModule name="Reverb" />
            <EffectsCoupler />
            <EffectsModule name="Delay" />
            <EffectsCoupler />
          </div>
        </div>
        <div className="layout-editor">
        </div>
      </div>
    );

    var pageB = (
      <div className="layout">
        {/*
        <LayoutPage />
        */}
        <LayoutConsole expanded={this.props.navigation.console} />
        {this.renderPageOverlay()}
      </div>
    );

    switch( this.state.page )
    {
      default:
      case 'A': var selectedPage = pageA; break;
      case 'B': var selectedPage = pageB; break;
    }

    return (
      <div className={layoutClasses}>
        <div className="layout-switch">
          <a onClick={this.togglePage.bind(this, 'A')}>A</a>
          <a onClick={this.togglePage.bind(this, 'B')}>B</a>
        </div>
        {selectedPage}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    navigation: state.navigation,
    cursor: state.cursor
  };
}

export default connect(mapStateToProps)(Layout);
