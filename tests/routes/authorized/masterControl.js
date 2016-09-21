import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'
import socketClientIO from 'socket.io-client'

export default ({
  globals,
  author,
  observer,
  phraseId,
}) => {
  let addUrl = `${globals.domain}/api/masterControl/add`
  let removeUrl = `${globals.domain}/api/masterControl/remove`

  describe(`masterControl`, () => {
    it(`should successfully add a user to master control array`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url: addUrl,
        body: {
          userId: author.id,
          token: author.token,
          phraseId,
          targetUserId: observer.id,
        },
      })

      let { message } = await response.json()
      expect(message).to.eq(`User added to master control.`)
    })

    it(`should notify users that master control has changed`, () => {
      let client = socketClientIO.connect(`http://localhost:9999`)

      client.on(`server::masterControlChanged`, data => {
        expect(data.targetUserId).to.eq(observer.id)
        client.disconnect()
      })

      ajax({
        url: addUrl,
        body: {
          userId: author.id,
          token: author.token,
          phraseId,
          targetUserId: observer.id,
        },
      })
    })

    it(`should fail if user does not exist`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url: addUrl,
        body: {
          userId: author.id,
          token: author.token,
          phraseId,
          targetUserId: `fake-id`,
        },
      })

      let { message } = await response.json()
      expect(message).to.eq(`Target user does not exist.`)
    })

    it(`should allow user in master control to remove themselves`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url: removeUrl,
        body: {
          userId: observer.id,
          token: observer.token,
          phraseId,
        },
      })

      let { message } = await response.json()
      expect(message).to.eq(`User removed from master control.`)
    })
  })
}
