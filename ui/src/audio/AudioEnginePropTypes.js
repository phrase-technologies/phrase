import React, { Component } from 'react'

export default React.PropTypes.shape({
  fireNote: React.PropTypes.func.isRequired,
  killNote: React.PropTypes.func.isRequired,
  destroy:  React.PropTypes.func.isRequired
})

