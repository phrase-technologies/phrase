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

    // maybe later people can choose what fields are private, but username MUST be public
    it(`should only return username`, async function() {
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
      /* eslint-disable */
      // if you find a rule that allows unused-vars when excluding, add it!
      // .. and I'll buy you a beer. - azium
      expect(users.every(
        ({ username, ...rest }) => !Object.keys(rest).length
      )).to.be.true
    })
  })
}
