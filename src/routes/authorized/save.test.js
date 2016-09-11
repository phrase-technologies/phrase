import r from 'rethinkdb'
import { expect } from 'chai'
import ajax from '../../helpers/ajax'
import { domain } from '../../root.test'

let url = `${domain}/api/save`

// let user = {
//   email: `foo@foo`,
//   username: `foo`,
//   password: `best_password_bro`,
// }

describe(`save`, () => {
  it(`returns 403 without valid credentials`, async function() {
    this.timeout(100000)
    let response = await ajax({ url })
    expect(response.status).to.eq(403)
  })

  it(`returns 403 without valid credentials`, async function() {
    this.timeout(100000)
    let response = await ajax({ url })
    expect(response.status).to.eq(403)
  })
})
