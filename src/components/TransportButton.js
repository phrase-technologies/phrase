import React, { Component } from 'react';

export default class TransportButton extends Component {

  onClick() {
    console.log( "[" + this.props.type + "] clicked!" );
  }
  
  render() {
    var buttonClasses = "btn btn-link btn-glow btn-lg " + ( this.props.toggle ? "active" : "" );
    var iconClasses = "fa fa-" + this.props.type;

    return (
      <button type="button" className={buttonClasses} onClick={this.onClick.bind(this)}>
        <i className={iconClasses} />
      </button>
    );
  }
}
