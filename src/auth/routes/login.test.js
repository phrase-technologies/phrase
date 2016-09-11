import r from 'rethinkdb'
import { expect } from 'chai'
import ajax from '../../helpers/ajax'
import { domain } from '../../root.test'

let url = `${domain}/api/login`
//
let user = {
  email: `foo@foo`,
  username: `foo`,
  password: `best_password_bro`,
}

describe(`login`, () => {
  it(`should warn about missing fields`, async function() {
    this.timeout(100000)
    let response = await ajax({ url })
    let { message } = await response.json()
    expect(message).to.eq(`Must provide an email and password.`)
  })

  it(`should warn about nonexistant user`, async function() {
    this.timeout(100000)
    let response = await ajax({ url, body: user })
    let { message } = await response.json()
    expect(message).to.eq(`User not found.`)
  })
})
