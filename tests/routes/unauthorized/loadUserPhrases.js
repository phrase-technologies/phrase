import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'

let fakeUser = {
  username: `bar`,
}

export default ({ domain, user }) => {
  let url = `${domain}/api/loadUserPhrases`

  describe(`loadUserPhrases`, () => {
    it(`returns 404 for nonexistant users`, async function() {
      this.timeout(100000)
      let response = await ajax({ url, body: fakeUser })
      expect(response.status).to.eq(404)
    })

    it(`returns 200 and empty array for existing users with no phrases`, async function() {
      this.timeout(100000)
      let response = await ajax({ url, body: user })
      let body = await response.json()
      expect(response.status).to.eq(200)
      expect(body.phrases.length).to.eq(0)
    })
  })
}
