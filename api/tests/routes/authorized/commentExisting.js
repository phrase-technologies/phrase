import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'
import socketClientIO from 'socket.io-client'

export default ({ globals, author, collaborator, observer, privatePhraseId, publicPhraseId }) => {
  let url = `${globals.domain}/api/commentExisting`

  describe(`commentExisting`, () => {
    it(`endpoint should exist`, async function() {
      this.timeout(100000)
      let response = await ajax({ url, body: { token: author.token, userId: author.id } })
      expect(response.status).to.not.eq(404)
    })

    it(`should reject unauthenticated attempts`, async function() {
      this.timeout(100000)
      let response = await ajax({ url })
      expect(response.status).to.eq(401)
    })

    it(`should require phraseId`, async function() {
      let response = await ajax({
        url,
        body: {
          token: author.token,
          userId: author.id,
        },
      })
      let { success, message } = await response.json()
      expect(message).to.eq("Must provide a phraseId")
      expect(success).to.eq(false)
    })

    it(`should reject unauthorized access for private phrases`, async function() {
      this.timeout(100000)
      let response = await ajax({
        url,
        body: {
          token: observer.token,
          userId: observer.id,
          phraseId: privatePhraseId,
        },
      })
      expect(response.status).to.eq(403)
    })

    it(`should allow collaborator access for private phrases`, async function() {
      this.timeout(100000)
      let response = await ajax({
        url,
        body: {
          token: collaborator.token,
          userId: collaborator.id,
          phraseId: privatePhraseId,
        },
      })
      expect(response.status).to.eq(200)
    })

    it(`should allow access by random observers for public phrases`, async function() {
      this.timeout(100000)
      let response = await ajax({
        url,
        body: {
          token: observer.token,
          userId: observer.id,
          phraseId: publicPhraseId,
        },
      })
      expect(response.status).to.eq(200)
    })

    it(`should return an array of comments`, async function() {
      let response = await ajax({
        url,
        body: {
          token: author.token,
          userId: author.id,
          phraseId: privatePhraseId,
        },
      })

      let { comments } = await response.json()
      expect(comments).to.be.an("array")
    })

  })
}
