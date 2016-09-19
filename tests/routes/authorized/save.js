import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'

let phraseState = {}
let phraseName = `testPhrase`

export default ({ globals, user, token }) => {
  let url = `${globals.domain}/api/save`

  return new Promise(resolve => {
    describe(`save`, () => {
      it(`returns 403 without valid credentials`, async function() {
        this.timeout(100000)
        let response = await ajax({ url })
        expect(response.status).to.eq(403)
      })

      // This test is very general, should move it out to its own thing
      it(`should complain if no phraseState provided`, async function() {
        this.timeout(100000)
        let response = await ajax({ url, body: user })
        let { message } = await response.json()
        expect(message).to.eq(`State must exist to save.`)
      })

      // This test is very general, should move it out to its own thing
      it(`should complain if no token provided`, async function() {
        this.timeout(100000)
        // remove token for this test
        let { token, ...userWithoutToken } = user // eslint-disable-line
        let response = await ajax({ url, body: { ...userWithoutToken, phraseState: {} }})
        let { message } = await response.json()
        expect(message).to.eq(`No token provided.`)
      })

      it(`should successfully save a phrase`, async function() {
        this.timeout(100000)
        let response = await ajax({ url, body: { ...user, token, phraseState, phraseName }})
        let { message, phraseId } = await response.json()
        expect(message).to.eq(`Project Saved!`)

        // Needed for subsequent tests
        resolve({ phraseId })
      })
    })
  })
}
