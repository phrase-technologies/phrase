import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'

export default ({
  domain,
  user,
  searchTerm,
}) => {
  let url = `${domain}/api/searchUsers`

  describe(`searchUsers`, () => {
    it(`should exist`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url,
        body: {
          userId: user.id,
          token: user.token,
          searchTerm,
        },
      })

      expect(response.status).to.eq(200)
    })

    it(`should return a valid user array`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url,
        body: {
          userId: user.id,
          token: user.token,
          searchTerm,
        },
      })

      let { users } = await response.json()
      expect(users).to.have.length
    })
  })
}
