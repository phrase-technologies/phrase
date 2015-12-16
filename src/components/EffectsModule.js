import React, { Component } from 'react';

export default class EffectsModule extends Component {

  constructor() {
    super();
    this.state = {
      collapsed: false
    }
  }

  handleToggle(e) {
    this.setState({collapsed: !this.state.collapsed});
  }

  renderCollapsible() {
    if( !this.props.collapsible )
      return null;
    
    var toggleClasses = ' fa ';
        toggleClasses += this.state.collapsed ? 'fa-plus-square-o' : 'fa-minus-square-o';
    return (
      <span className={'effects-module-toggle'+toggleClasses} onClick={this.handleToggle.bind(this)} />
    );
  }

  render() {
    var fillParentClass = this.props.fillParent ? ' fill-parent' : '';
    var collapsedClass = this.state.collapsed ? ' collapsed' : '';

    return (
      <div className={'effects-module'+collapsedClass+fillParentClass}>
        <div className="effects-module-header">
          <h1>
            {this.props.name}
            <span className="caret"/>
          </h1>
          {this.renderCollapsible()}
        </div>
        <div className="effects-module-body">
          {this.props.children}
        </div>
      </div>
    );
  }
}
