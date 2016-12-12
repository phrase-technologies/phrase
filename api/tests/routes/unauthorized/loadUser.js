import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'

export default ({ globals, observer }) => {
  let url = `${globals.domain}/api/loadUser`

  describe(`loadUser`, () => {
    it(`should exist`, async function() {
      this.timeout(100000)
      let response = await ajax({ url })
      expect(response.status).to.eq(200)
    })

    it(`should complain if theUserId parameter is missing`, async function() {
      this.timeout(100000)
      let response = await ajax({ url, body: { userId: observer.id } })
      let { message } = await response.json()
      expect(message).to.eq(`Must supply a userId`)
    })

    it(`should return 404 if no user found`, async function() {
      this.timeout(100000)
      let response = await ajax({
        url,
        body: {
          userId: observer.id,
          theUserId: `fake id`,
        },
      })
      expect(response.status).to.eq(404)
      let { message } = await response.json()
      expect(message).to.eq(`User not found!`)
    })

    it(`should retreive a user by its id`, async function() {
      this.timeout(100000)
      let response = await ajax({
        url,
        body: {
          userId: observer.id,
          theUserId: observer.id,
        },
      })
      let { loadedUser } = await response.json()
      expect(loadedUser.id).to.eq(observer.id)
    })

  })
}
