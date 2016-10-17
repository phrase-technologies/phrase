import { expect } from 'chai'
import supertest from 'supertest'

import ajax from '../../../src/helpers/ajax'

export default ({ globals, author, observer, phraseId }) => {
  let endpoint = `/api/uploadTrackAudio`
  let url = `${globals.domain}${endpoint}`

  describe(`uploadTrackAudio`, () => {
    let audioFile = `tests/data/test.mp3`
    let badAudioFile = `tests/data/not_an_mp3.mp3`
    let imageFile = `tests/data/test.jpg`
    let m4aAudioFile = `tests/data/test.m4a`
    let request = supertest(globals.app)

    it(`endpoint should exist`, async function() {
      this.timeout(100000)
      let response = await ajax({ url })
      expect(response.status).to.not.eq(404)
    })

    it(`should ignore an unexpected file`, async function() {
      this.timeout(10000)
      let response = await new Promise((resolve, reject) => {
        request.post(`/api/uploadTrackAudio`)
          .field(`token`, author.token)
          .field(`userId`, author.id)
          .attach(`fakeAudioFile`, audioFile)
          .end((err, res) => {
            if (err) reject(err)
            else resolve(res.body)
          })
      })
      expect(response.error).to.eq(`Missing audio file`)
    })

    it(`should warn of a missing file`, async function() {
      this.timeout(10000)
      let response = await new Promise((resolve, reject) => {
        request.post(`/api/uploadTrackAudio`)
          .field(`token`, author.token)
          .field(`userId`, author.id)
          .end((err, res) => {
            if (err) reject(err)
            else resolve(res.body)
          })
      })
      expect(response.error).to.eq(`Missing audio file`)
    })

    it(`should warn of a missing phraseId`, async function() {
      this.timeout(10000)
      let response = await new Promise((resolve, reject) => {
        request.post(`/api/uploadTrackAudio`)
          .field(`token`, author.token)
          .field(`userId`, author.id)
          .attach(`audioFile`, audioFile)
          .end((err, res) => {
            if (err) reject(err)
            else resolve(res.body)
          })
      })
      expect(response.title).to.eq(`Missing phraseId`)
    })

    it(`should reject an invalid phraseId`, async function() {
      this.timeout(10000)
      let response = await new Promise((resolve, reject) => {
        request.post(`/api/uploadTrackAudio`)
          .field(`token`, author.token)
          .field(`userId`, author.id)
          .field(`phraseId`, `totally not a phraseId`)
          .attach(`audioFile`, audioFile)
          .end((err, res) => {
            if (err) reject(err)
            else resolve(res)
          })
      })
      expect(response.status).to.eq(404)
      expect(response.body.message).to.eq(`Invalid phraseId`)
    })

    it(`should reject a user without permission`, async function() {
      this.timeout(10000)
      let response = await new Promise((resolve, reject) => {
        request.post(`/api/uploadTrackAudio`)
          .field(`token`, observer.token)
          .field(`userId`, observer.id)
          .field(`phraseId`, phraseId)
          .attach(`audioFile`, audioFile)
          .end((err, res) => {
            if (err) reject(err)
            else resolve(res)
          })
      })
      expect(response.status).to.eq(403)
      expect(response.body.message).to.eq(`You do not have permission to edit this phrase`)
    })

    it(`should reject an invalid file`, async function() {
      this.timeout(10000)
      let response = await new Promise((resolve, reject) => {
        request.post(`/api/uploadTrackAudio`)
          .field(`token`, author.token)
          .field(`userId`, author.id)
          .field(`phraseId`, phraseId)
          .attach(`audioFile`, badAudioFile)
          .end((err, res) => {
            if (err) reject(err)
            else resolve(res.body)
          })
      })
      expect(response.title).to.eq(`Invalid audio file`)
    })

    it(`should reject an unsupported audio file`, async function() {
      this.timeout(10000)
      let response = await new Promise((resolve, reject) => {
        request.post(`/api/uploadTrackAudio`)
          .field(`token`, author.token)
          .field(`userId`, author.id)
          .field(`phraseId`, phraseId)
          .attach(`audioFile`, imageFile)
          .end((err, res) => {
            if (err) reject(err)
            else resolve(res.body)
          })
      })
      expect(response.title).to.eq(`Invalid audio file`)
    })

    it(`should accept and save an mp3`, async function() {
      this.timeout(10000)
      let response = await new Promise((resolve, reject) => {
        request.post(`/api/uploadTrackAudio`)
          .field(`token`, author.token)
          .field(`userId`, author.id)
          .field(`phraseId`, phraseId)
          .attach(`audioFile`, audioFile)
          .end((err, res) => {
            if (err) reject(err)
            else resolve(res.body)
          })
      })
      expect(response.success).to.eq(true)
      expect(response.audioFile).to.include(phraseId)
      expect(response.audioFile).to.include(`.mp3`)
    })

    it(`should accept, convert, and save an m4a`, async function() {
      this.timeout(10000)
      let response = await new Promise((resolve, reject) => {
        request.post(`/api/uploadTrackAudio`)
          .field(`token`, author.token)
          .field(`userId`, author.id)
          .field(`phraseId`, phraseId)
          .attach(`audioFile`, m4aAudioFile)
          .end((err, res) => {
            if (err) reject(err)
            else resolve(res.body)
          })
      })
      expect(response.success).to.eq(true)
      expect(response.audioFile).to.include(phraseId)
      expect(response.audioFile).to.include(`.mp3`)
    })
  })
}
