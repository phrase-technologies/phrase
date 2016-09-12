import r from 'rethinkdb'
import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'

export default ({ domain, testUser }) => {
  let url = `${domain}/signup`

  describe(`signup`, () => {
    it(`requires an invite code`, async function() {
      this.timeout(100000)
      let response = await ajax({ url, body: testUser })
      let { message } = await response.json()
      expect(message.inviteCodeError).to.eq(`Invite Code is required.`)
    })

    it(`will reject an invalid invite code`, async function() {
      this.timeout(100000)

      let response = await ajax({ url, body: {
        inviteCode: `totally not a good code`,
        ...testUser,
      }})

      let { message } = await response.json()

      expect(message.inviteCodeError).to.eq(`Invalid Code.`)
    })

    it(`should be successful with valid fields + invite code`, async function() {
      this.timeout(100000)

      let db = await r.connect({ host: `localhost`, db: `test`, port: 28015 })
      let cursor = await r.table(`inviteCodes`).limit(1).run(db)
      let inviteCodes = await cursor.toArray()
      let inviteCode = inviteCodes[0].code

      let response = await ajax({ url, body: { inviteCode, ...testUser }})
      let { success } = await response.json()
      expect(success).to.be.true
    })
  })
}
