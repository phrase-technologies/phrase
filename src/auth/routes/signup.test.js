import { expect } from 'chai'
import fetch from 'isomorphic-fetch'

describe(`signup`, () => {
  it(`requires an invite code`, async function() {
    this.timeout(100000)
    let response = await fetch(`http://localhost:9999/signup`, {
      method: `POST`,
      headers: { 'Content-Type': `application/json` },
      body: JSON.stringify({
        email: `foo@foo`,
        username: `foo`,
        password: `best_password_bro`,
      }),
    })

    let { message } = await response.json()
    expect(message.inviteCodeError).to.eq(`Invite Code is required.`)
  })
})
