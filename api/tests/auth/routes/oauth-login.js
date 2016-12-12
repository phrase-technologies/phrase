import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'
import { handleOAuth } from '../../../src/helpers/oAuth'
import { rOAuthGetFromEmail, rUserInsert, rUserGetFromEmail } from '../../../src/helpers/db-helpers'

let fakeUser = {
  email: `fake@fake-oauth-test`,
  picture: `https://fakephoto.com/photo.jpg`,
  username: `oAuthTestUser`,
  password: `fake_password_bro`,
}

export default ({ globals }) => {
  describe(`oauth-login`, () => {
    let url = `${globals.domain}/oauth-login`

    it(`should return success: false if given an invalid profile`, async function() {
      await handleOAuth({
        profile: {},
        done: (err, user) => { expect(user.success).to.eq(false) },
        db: globals.db,
      })
    })

    it(`should warn of missing email`, async function() {
      this.timeout(10000)
      let response = await ajax({ url, body: { token: `not a real token` }})
      let { success, message } = await response.json()
      expect(success).to.eq(false)
      expect(message.oAuthError).to.eq(`Missing email, please try again.`)
    })

    it(`should warn of missing token`, async function() {
      this.timeout(10000)
      let response = await ajax({ url, body: { email: `not a real email` }})
      let { success, message } = await response.json()
      expect(success).to.eq(false)
      expect(message.oAuthError).to.eq(`Missing oAuth token, please try again.`)
    })

    it(`should warn of missing fields`, async function() {
      this.timeout(10000)
      let response = await ajax({ url, body: { }})
      let { success, message } = await response.json()
      expect(success).to.eq(false)
      expect(message.oAuthError).to.eq(`Missing email and oAuth token, please try again.`)
    })

    it(`should warn of non-existant user`, async function() {
      this.timeout(10000)
      let response = await ajax({ url, body: { email: `fake email`, token: `fake token` }})
      let { success, message } = await response.json()
      expect(success).to.eq(false)
      expect(message.oAuthError).to.eq(`User not found, please sign up.`)
    })

    it(`should insert oAuth credentials if given a valid profile`, async function() {
      this.timeout(10000)
      await handleOAuth({
        profile: {
          emails: [ { value: fakeUser.email }],
          photos: [ { value: fakeUser.picture }],
        },
        done: (err, user) => {
          expect(user.success).to.eq(true)
          expect(user.email).to.eq(fakeUser.email)
          expect(user.newUser).to.eq(true)
        },
        db: globals.db,
      })

      let oAuth = await rOAuthGetFromEmail(globals.db, { email: fakeUser.email })
      expect(oAuth.email).to.eq(fakeUser.email)
      expect(oAuth.picture).to.eq(fakeUser.picture)
    })

    it(`should update existing user's picture`, async function() {
      this.timeout(10000)

      await rUserInsert(globals.db, {
        username: fakeUser.username,
        email: fakeUser.email,
      })

      await handleOAuth({
        profile: {
          emails: [ { value: fakeUser.email }],
          photos: [ { value: fakeUser.picture }],
        },
        done: () => {},
        db: globals.db,
      })

      let user = await rUserGetFromEmail(globals.db, { email: fakeUser.email })
      expect(user.picture).to.eq(fakeUser.picture)
    })

    it(`should reject an invalid oAuth token`, async function() {
      this.timeout(10000)
      let response = await ajax({ url, body: { email: fakeUser.email, token: `fake token` }})
      let { success, message } = await response.json()
      expect(success).to.eq(false)
      expect(message.oAuthError).to.eq(`oAuth tokens do not match, please try again.`)
    })

    it(`should allow users to login using oAuth token and email`, async function() {
      this.timeout(10000)
      // order matters, the tests above should leave a valid oAuth record in the db
      let oAuth = await rOAuthGetFromEmail(globals.db, { email: fakeUser.email})
      expect(oAuth.email).to.eq(fakeUser.email)

      let response = await ajax({ url, body: { email: fakeUser.email, token: oAuth.oAuthToken }})
      let { success, user, token } = await response.json()
      expect(success).to.eq(true)
      expect(user).to.exist
      expect(token).to.exist
    })

    it(`should delete oAuth record on login`, async function() {
      this.timeout(10000)
      // order matters, the test above should have deleted the oAuth record in the db
      let oAuth = await rOAuthGetFromEmail(globals.db, { email: fakeUser.email})
      expect(oAuth).to.eq(undefined)
    })
  })
}
