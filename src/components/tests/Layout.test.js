import React from 'react'
import { shallow } from 'enzyme'
import { expect } from 'chai'
import { Layout } from '../Layout'

/*
 *  Shallow
 */

describe('<Layout />', () => {
  it('should exist', () => {
    let component = shallow(<Layout dispatch={ () => {} } />)
    expect(component).to.exist
  })
})
