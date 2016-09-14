import r from 'rethinkdb'
import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'

let inviteCodesUsed = 0

export default ({ domain, user }) => {
  let url = `${domain}/signup`

  return new Promise(resolve => {
    describe(`signup`, () => {
      it(`requires an invite code`, async function() {
        this.timeout(100000)
        let response = await ajax({ url, body: user })
        let { message } = await response.json()
        expect(message.inviteCodeError).to.eq(`Invite Code is required.`)
      })

      it(`will reject an invalid invite code`, async function() {
        this.timeout(100000)

        let response = await ajax({ url, body: {
          inviteCode: `totally not a good code`,
          ...user,
        }})

        let { message } = await response.json()

        expect(message.inviteCodeError).to.eq(`Invalid Code.`)
      })

      it(`should be successful with valid fields + invite code`, async function() {
        this.timeout(100000)

        let db = await r.connect({ host: `localhost`, db: `test`, port: 28015 })
        let cursor = await r.table(`inviteCodes`).run(db)
        let inviteCodes = await cursor.toArray()
        let inviteCode = inviteCodes[inviteCodesUsed].code

        // Multiple users will signup over the course of the tests
        inviteCodesUsed++

        let response = await ajax({ url, body: { inviteCode, ...user }})
        let { success } = await response.json()
        expect(success).to.be.true

        // Last test in this suite, will be run again for other users
        resolve()
      })
    })
  })
}
