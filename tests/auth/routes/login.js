import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'

let fakeUser = {
  email: `fake@fake`,
  username: `fake`,
  password: `fake_password_bro`,
}

export default ({ domain, testUser }) => {
  return new Promise(resolve => {
    let url = `${domain}/api/login`

    describe(`login`, () => {
      it(`should warn about missing email`, async function() {
        this.timeout(100000)
        let response = await ajax({ url, body: { password: `foo` }})
        let { message } = await response.json()
        expect(message).to.eq(`Must provide an email/username.`)
      })

      it(`should warn about missing password`, async function() {
        this.timeout(100000)
        let response = await ajax({ url, body: { email: `foo` }})
        let { message } = await response.json()
        expect(message).to.eq(`Must provide a password.`)
      })

      it(`should warn about missing fields`, async function() {
        this.timeout(100000)
        let response = await ajax({ url })
        let { message } = await response.json()
        expect(message).to.eq(`Must provide an email/username and password.`)
      })

      it(`should warn about nonexistant user`, async function() {
        this.timeout(100000)
        let response = await ajax({ url, body: fakeUser })
        let { message } = await response.json()
        expect(message).to.eq(`User not found.`)
      })

      it(`should return a jwt on successful login`, async function() {
        this.timeout(100000)
        let response = await ajax({ url, body: testUser })
        let { message, token, user } = await response.json()
        expect(token).to.exist
        expect(user).to.exist
        expect(message).to.eq(`Enjoy your token!`)

        // This info will be used for subsequent tests
        resolve({ token, user })
      })
    })
  })
}
