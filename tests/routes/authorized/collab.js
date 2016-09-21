import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'
import socketClientIO from 'socket.io-client'

export default ({
  globals,
  author,
  collaborator,
  phraseId,
}) => {
  let addUrl = `${globals.domain}/api/collab/add`
  let removeUrl = `${globals.domain}/api/collab/remove`

  describe(`collab`, () => {
    it(`author should be able to add a collaborator`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url: addUrl,
        body: {
          userId: author.id,
          token: author.token,
          phraseId,
          targetUserId: collaborator.id,
        },
      })

      let { message } = await response.json()
      expect(message).to.eq(`Collaborator added!`)
    })

    it(`should not be contain two of the same collaborator in the list`, async function() {
      this.timeout(10000)

      let response = await ajax({
        url: addUrl,
        body: {
          userId: author.id,
          token: author.token,
          phraseId,
          targetUserId: collaborator.id,
        },
      })

      let { message } = await response.json()
      expect(message).to.eq(`User is already a collaborator on this phrase.`)
    })

    it(`should notify users about a new collaborator`, () => {
      let client = socketClientIO.connect(`http://localhost:9999`)

      client.on(`server::collaboratorAdded`, data => {
        expect(data.userId).to.eq(collaborator.id)
        client.disconnect()
      })

      ajax({
        url: addUrl,
        body: {
          userId: author.id,
          token: author.token,
          phraseId,
          targetUserId: collaborator.id,
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

    it(`should allow the author to remove a callobartor`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url: removeUrl,
        body: {
          userId: author.id,
          token: author.token,
          phraseId,
          targetUserId: collaborator.id,
        },
      })

      let { message } = await response.json()
      expect(message).to.eq(`Collaborator removed.`)
    })

    it(`should allow collaborator to leave`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url: removeUrl,
        body: {
          userId: collaborator.id,
          token: collaborator.token,
          phraseId,
        },
      })

      let { message } = await response.json()
      expect(message).to.eq(`Collaborator left.`)
    })

    it(`should notify others that collaborater has left`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url: removeUrl,
        body: {
          userId: collaborator.id,
          token: collaborator.token,
          phraseId,
        },
      })

      let { message } = await response.json()
      expect(message).to.eq(`Collaborator left.`)
    })
  })
}
