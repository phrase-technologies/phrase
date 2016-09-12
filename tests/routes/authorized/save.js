import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'

let phraseState = {}
let phraseName = `testPhrase`

export default ({ domain, user, token }) => {
  let url = `${domain}/api/save`

  describe(`save`, () => {
    it(`returns 403 without valid credentials`, async function() {
      this.timeout(100000)
      let response = await ajax({ url })
      expect(response.status).to.eq(403)
    })

    // This test is very general, should move it out to its own thing
    it(`should complain if no token provided`, async function() {
      this.timeout(100000)
      let response = await ajax({ url, body: user })
      let { message } = await response.json()
      expect(message).to.eq(`No token provided.`)
    })

    it(`should complain if missing fields`, async function() {
      this.timeout(100000)
      let response = await ajax({ url, body: { ...user, token }})
      let { message } = await response.json()
      expect(message).to.eq(`something went wrong!`)
    })

    it(`should successfully save a phrase`, async function() {
      this.timeout(100000)
      let response = await ajax({ url, body: { ...user, token, phraseState, phraseName }})
      let { message } = await response.json()
      expect(message).to.eq(`Project Saved!`)
    })
  })
}
