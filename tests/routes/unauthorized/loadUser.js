import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'

export default ({ globals, author, observer, publicPhraseId, privatePhraseId }) => {
  let url = `${globals.domain}/api/loadUser`

  describe(`loadUser`, () => {
    it(`should exist`, async function() {
      this.timeout(100000)
      let response = await ajax({ url })
      expect(response.status).to.eq(200)
    })

    it(`should return 404 if no user found`, async function() {
      this.timeout(100000)
      let response = await ajax({ url, body: { userId: `fake-id` } })
      let { message } = await response.json()
      expect(message).to.eq(`User not found!`)
    })

    it(`should retreive a user by its id`, async function() {
      this.timeout(100000)
      let response = await ajax({ url, body: { userId: observer.id } })
      let { loadedUser } = await response.json()
      expect(loadedUser.id).to.eq(observer.id)
    })

  })
}
