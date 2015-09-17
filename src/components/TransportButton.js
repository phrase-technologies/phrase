import React, { Component } from 'react';

export default class TransportButton extends Component {
  render() {
    var buttonClasses = `btn btn-link btn-glow btn-lg ${this.props.toggle ? "active" : ""}`;
    var iconClasses = `fa fa-${this.props.type}`;

    return (
      <button type="button" className={buttonClasses}
              onClick={this.props.onButtonClick}>
        <i className={iconClasses} />
      </button>
    );
  }
}