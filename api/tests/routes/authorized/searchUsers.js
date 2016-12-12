import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'

export default ({
  globals,
  user,
  userToSearch,
}) => {
  let url = `${globals.domain}/api/searchUsers`

  describe(`searchUsers`, () => {
    it(`should exist`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url,
        body: {
          userId: user.id,
          token: user.token,
          searchTerm: '',
        },
      })

      expect(response.status).to.eq(200)
    })

    it(`should return a lengthy array if found a user by username`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url,
        body: {
          userId: user.id,
          token: user.token,
          searchTerm: userToSearch.username,
        },
      })

      let { users } = await response.json()
      expect(users).to.have.length.above(0)
    })

    it(`should return a lengthy array if found a user by email`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url,
        body: {
          userId: user.id,
          token: user.token,
          searchTerm: userToSearch.email,
        },
      })

      let { users } = await response.json()
      expect(users).to.have.length.above(0)
    })

    // maybe later people can choose what fields are private, but username MUST be public
    it(`should only return username and userId`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url,
        body: {
          userId: user.id,
          token: user.token,
          searchTerm: userToSearch.username,
        },
      })

      let { users } = await response.json()
      /* eslint-disable */
      // if you find a rule that allows unused-vars when excluding, add it!
      // .. and I'll buy you a beer. - azium
      expect(users.every(
        ({ username, userId, ...rest }) => !Object.keys(rest).length
      )).to.be.true
      expect(users.every(x => x.userId)).to.be.true
      expect(users.every(x => x.username)).to.be.true
    })
  })
}
