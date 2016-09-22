// Subscribe to changefeeds
import r from 'rethinkdb'
import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'
import socketClientIO from 'socket.io-client'

export default ({ globals, author, observer, phraseId }) => {
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
      expect(response.status).to.eq(403)
    })

    it(`should require phraseId`, async function() {
      let comment = "Where's my snare?"
      let response = await ajax({
        url,
        body: {
          token: author.token,
          userId: author.id,
          trackId: 123,
          comment,
        },
      })
      let { success, message } = await response.json()
      expect(success).to.eq(false)
      expect(message).to.eq("Must provide a phraseId")
    })

    it(`should require trackId`, async function() {
      let comment = "Where's my snare?"
      let response = await ajax({
        url,
        body: {
          token: author.token,
          userId: author.id,
          phraseId,
          comment,
        },
      })
      let { success, message } = await response.json()
      expect(success).to.eq(false)
      expect(message).to.eq("Must provide trackId")
    })

    it(`should reject empty comments`, async function() {
      let response = await ajax({
        url,
        body: {
          token: author.token,
          userId: author.id,
          trackId: 123,
          phraseId,
        },
      })
      let { success, message } = await response.json()
      expect(success).to.eq(false)
      expect(message).to.eq("Invalid comment")
    })

    it(`should reject unauthorized comments`, async function() {
      this.timeout(100000)
      let response = await ajax({
        url,
        body: {
          comment: "Hide yo wife!",
          userId: observer.id,
          phraseId,
        },
      })
      expect(response.status).to.eq(403)
    })

    it(`should save successfully`, async function() {
      let response = await ajax({
        url,
        body: {
          token: author.token,
          userId: author.id,
          comment: "Will the real Slim Shady please stand up?!",
          phraseId,
          trackId: 0,
        },
      })

      let { success, message } = await response.json()
      expect(success).to.eq(true)
      expect(message).to.eq("Comment added!")
      expect(response.status).to.eq(200)
    })

    it(`should result in changefeed update`, (done) => {
      let comment = "Will the real Slim Shady please stand up?!"

      let socket = socketClientIO.connect(`http://localhost:9999`)
      socket.emit(`client::joinRoom`, { phraseId, username: author.username })
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
            phraseId,
            trackId: 0,
          },
        })
      }, 64)
    })

  })
}
