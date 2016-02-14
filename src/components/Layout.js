import React, { Component } from 'react';
import { connect } from 'react-redux';

import { layoutConsoleEmbedded,
         layoutConsoleSplit } from '../actions/actionsLayout.js';

import CursorProvider from './CursorProvider.js';
import LayoutPage from './LayoutPage.js';
import LayoutSplit from './LayoutSplit.js';
import Mixer from './Mixer.js';
import Transport from './Transport.js';
import Pianoroll from './Pianoroll.js';

export default class Layout extends Component {

  constructor() {
    super();
    this.handleConsoleSplitDrag = this.handleConsoleSplitDrag.bind(this);
  }

  render() {
    var layoutConsoleClasses = 'layout-console';
        layoutConsoleClasses += this.props.consoleEmbedded ? ' layout-console-embedded' : '';

    return (
      <CursorProvider>
        <div className="disable-select">
          <div className={layoutConsoleClasses}>
            {/*
            <LayoutPage />
            */}
            <div className="layout-console-header">
              <Transport />
            </div>
            <div className="layout-console-body">
              <div className="layout-console-main" style={this.getMainSplit()}>
                <div className="layout-console-mixer" style={this.getMixerSplit()}>
                  {this.renderMixer()}
                </div>
                <LayoutSplit splitRatio={this.props.consoleSplitRatio} setRatio={this.handleConsoleSplitDrag} />
                <div className="layout-console-clip" style={this.getClipSplit()}>
                  {this.renderClip()}
                </div>
              </div>
              <div className="layout-console-effects-chain" style={this.getSidebarSplit()}>
                {this.renderEffectsChain()}
              </div>
            </div>
            {this.renderPageOverlay()}
          </div>
        </div>
      </CursorProvider>
    )
  }

  renderMixer() {
    if( this.props.consoleSplitRatio < 0.2 && this.props.focusedTrack !== null )
    {
      return (
        <h2 className="layout-console-heading" onClick={() => this.handleConsoleSplitDrag(0.5)}>
          Arrangement
          <span className="fa fa-plus-square pull-right" />
        </h2>
      );
    }
    else
      return ( <Mixer /> );
  }

  renderClip() {
    if( this.props.consoleSplitRatio > 0.8 || this.props.focusedTrack === null )
    {
      return (
        <h2 className="layout-console-heading" onClick={() => this.handleConsoleSplitDrag(0.5)}>
          Clip Editor
          <span className="fa fa-plus-square pull-right" />
        </h2>
      );
    }
    else
      return ( <Pianoroll /> );
  }

  renderEffectsChain() {
    if( !this.props.sidebar )
    {
      return (
        <h2 className="layout-console-heading">
          <span className="layout-console-heading-vertical">
            <span>Effects Chain </span>
            <span className="fa fa-plus-square" />
          </span>
        </h2>
      );
    }
    else
      return null;
  }

  renderPageOverlay() {
    var pageOverlayClasses = this.props.consoleEmbedded
                           ? 'layout-page-overlay layout-overlay-hidden'
                           : 'layout-page-overlay';
    return (
      <div className={pageOverlayClasses} onClick={() => this.props.dispatch(layoutConsoleEmbedded())} />
    );
  }

  handleConsoleSplitDrag(ratio) {
    this.props.dispatch(layoutConsoleSplit(ratio));
    window.dispatchEvent(new Event('resize'));
  }

  getMixerSplit() {
    if     ( this.props.focusedTrack === null ) return { bottom: 0 }
    else if( this.props.consoleSplitRatio < 0.2 ) return { height: 45 };
    else if( this.props.consoleSplitRatio > 0.8 ) return { bottom: 45 };
    else                                     return { bottom: ((1 - this.props.consoleSplitRatio) * 100) + '%' };
  }

  getClipSplit() {
    if     ( this.props.focusedTrack === null ) return { display: 'none' }
    else if( this.props.consoleSplitRatio < 0.2 ) return { top:    45 };
    else if( this.props.consoleSplitRatio > 0.8 ) return { height: 45 };
    else                                     return { top: (this.props.consoleSplitRatio  * 100) + '%' };
  }

  getMainSplit() {
    if( this.props.sidebar ) return { right: 300 };
    else                     return { right: 45 };
  }

  getSidebarSplit() {
    if( this.props.sidebar ) return { width: 300 };
    else                     return { width: 45 };
  }

  shouldComponentUpdate(nextProps) {
    // Ensure all canvases are re-rendered upon clip editor being shown
    if (this.props.focusedTrack === null && nextProps.focusedTrack !== null) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 0)
    }

    var propsToCheck = [
      'focusedTrack',
      'consoleEmbedded',
      'consoleSplitRatio'
    ]
    var changeDetected = propsToCheck.some(prop => {
      return nextProps[prop] !== this.props[prop]
    })
    return changeDetected
  }
}

function mapStateToProps(state) {
  return {
    focusedTrack: state.pianoroll.currentTrack,
    consoleEmbedded:   state.navigation.consoleEmbedded,
    consoleSplitRatio: state.navigation.consoleSplitRatio
  };
}

export default connect(mapStateToProps)(Layout);
