import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'

export class HeaderSearch extends Component {

  render() {
    let theme = 'solid' || this.props.theme
    let searchClasses = "form-control header-search"
        searchClasses += (theme === 'solid') ? ' form-control-dark' : ''

    return (
      <div className="btn-group">
        <div className="header-search-wrapper">
          <input
            className={searchClasses} id="header-search-input"
            type="text"
            placeholder="Search Phrases"
            ref={(ref) => this.inputField = ref}
            onChange={() => this.props.dispatch(librarySearch(this.inputField.value))}
            onFocus={this.searchFocus}
          />
          <span className="header-search-icon fa fa-search" />
        </div>
      </div>
    )
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
    this.inputField.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown)
    this.inputField.removeEventListener('keydown', this.handleKeyDown)
  }

  searchFocus = () => {
    this.props.dispatch(push('/search'))
    // this.inputField.blur()
  }

  handleKeyDown = (e) => {
    switch(e.keyCode) {
      // CMD/CTRL+F - Search
      case 70:
        if (e.metaKey || e.ctrlKey) {
          this.inputField.focus()
          e.preventDefault()
        }
        break
    }
  }

}

export default withRouter(
  connect()(HeaderSearch)
)
