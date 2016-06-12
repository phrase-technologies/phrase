import 'babel-polyfill'
import React from 'react'
import { shallow } from 'enzyme'
import { expect } from 'chai'
import { App } from '../App'

/*
 *  Shallow
 */

describe('<App />', () => {
  it('should exist', () => {
    let component = shallow(
      <App
        dispatch={ () => {} }
        routes={ [{}, { maximize: false }] }
      />
    )
    expect(component).to.exist
  })
})
