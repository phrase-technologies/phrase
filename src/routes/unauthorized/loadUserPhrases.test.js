import r from 'rethinkdb'
import { expect } from 'chai'
import ajax from '../../helpers/ajax'

let url = `http://localhost:9999/api/loadUserPhrases`

let user = {
  username: `foo`,
}

describe(`loadUserPhrases`, () => {
  it(`returns 404 for nonexistant users`, async function() {
    this.timeout(100000)
    let response = await ajax({ url, body: user })
console.log( "WHERE IS MY response.status?!", response )
    expect(response.status).to.eq(404)
  })
})
