import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'
import socketClientIO from 'socket.io-client'

export default ({ globals, author, collaborator, observer, privatePhraseId, publicPhraseId }) => {
  let url = `${globals.domain}/api/commentNew`

  describe(`commentNew`, () => {
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
          trackId: 123,
          comment: "Where's my snare?",
          tempKey: "DJ Khaled",
        },
      })
      let { success, message } = await response.json()
      expect(success).to.eq(false)
      expect(message).to.eq("Must provide a phraseId")
    })

    it(`should require trackId`, async function() {
      let response = await ajax({
        url,
        body: {
          token: author.token,
          userId: author.id,
          phraseId: privatePhraseId,
          comment: "Where's my snare?",
          tempKey: "DJ Khaled",
        },
      })
      let { success, message } = await response.json()
      expect(success).to.eq(false)
      expect(message).to.eq("Must provide trackId")
    })

    it(`should require tempKey`, async function() {
      let response = await ajax({
        url,
        body: {
          token: author.token,
          userId: author.id,
          comment: "Will the real Slim Shady please stand up?!",
          phraseId: privatePhraseId,
          trackId: 0,
        },
      })

      let { success, message } = await response.json()
      expect(success).to.eq(false)
      expect(message).to.eq("Must provide a tempKey")
    })

    it(`should reject empty comments`, async function() {
      let response = await ajax({
        url,
        body: {
          token: author.token,
          userId: author.id,
          trackId: 123,
          phraseId: privatePhraseId,
          tempKey: "DJ Khaled",
        },
      })
      let { success, message } = await response.json()
      expect(success).to.eq(false)
      expect(message).to.eq("Invalid comment")
    })

    it(`should reject unauthorized comments to private phrases`, async function() {
      this.timeout(100000)
      let response = await ajax({
        url,
        body: {
          token: observer.token,
          userId: observer.id,
          trackId: 123,
          comment: "Hide yo wife!",
          phraseId: privatePhraseId,
          tempKey: "DJ Khaled",
        },
      })
      expect(response.status).to.eq(403)
    })

    it(`should allow collaborator comments to private phrases`, async function() {
      this.timeout(100000)
      let response = await ajax({
        url,
        body: {
          token: collaborator.token,
          userId: collaborator.id,
          trackId: 123,
          comment: "Hide yo wife!",
          phraseId: privatePhraseId,
          tempKey: "DJ Khaled",
        },
      })
      expect(response.status).to.eq(200)
    })

    it(`should allow comments from random observers to public phrases`, async function() {
      this.timeout(100000)
      let response = await ajax({
        url,
        body: {
          token: observer.token,
          userId: observer.id,
          trackId: 123,
          comment: "Hide yo wife!",
          phraseId: publicPhraseId,
          tempKey: "DJ Khaled",
        },
      })
      expect(response.status).to.eq(200)
    })

    it(`should save successfully`, async function() {
      let response = await ajax({
        url,
        body: {
          token: author.token,
          userId: author.id,
          comment: "Will the real Slim Shady please stand up?!",
          phraseId: privatePhraseId,
          trackId: 0,
          tempKey: "DJ Khaled",
        },
      })

      let { success, message } = await response.json()
      expect(message).to.eq("Comment added!")
      expect(success).to.eq(true)
      expect(response.status).to.eq(200)
    })

    it(`should result in changefeed update`, (done) => {
      let comment = "Will the real Slim Shady please stand up?!"

      let socket = socketClientIO.connect(`http://localhost:9999`)
      socket.emit(`client::joinRoom`, {
        phraseId: privatePhraseId,
        username: author.username,
        userId: author.id,
      })
      socket.on(`server::commentsChangeFeed`, data => {
        expect(data.state.comment).to.eq(comment)
        socket.disconnect()
        done()
      })

      setTimeout(() => { // Avoid race condition where room is joined after the change is emitted
        ajax({
          url,
          body: {
            token: author.token,
            userId: author.id,
            comment,
            phraseId: privatePhraseId,
            trackId: 0,
            tempKey: "DJ Khaled",
          },
        })
      }, 64)
    })

  })
}
