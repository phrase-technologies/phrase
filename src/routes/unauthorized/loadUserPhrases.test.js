import { expect } from 'chai'
import ajax from '../../helpers/ajax'

let url = `http://localhost:9999/api/loadUserPhrases`

let userExisting = {
  username: `foo`,
}
let userFake = {
  username: `bar`,
}

describe(`loadUserPhrases`, () => {
  it(`returns 404 for nonexistant users`, async function() {
    this.timeout(100000)
    let response = await ajax({ url, body: userFake })
    expect(response.status).to.eq(404)
  })

  it(`returns 200 and empty array for existing users with no phrases`, async function() {
    this.timeout(100000)
    let response = await ajax({ url, body: userExisting })
    let body = await response.json()
    expect(response.status).to.eq(200)
    expect(body.phrases.length).to.eq(0)
  })
})
