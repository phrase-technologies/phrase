import r from 'rethinkdb'
import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'

export default ({ globals, author, observer, phraseId }) => {
  let url = `${globals.domain}/api/deletePhrase`

  describe(`deletePhrase`, () => {
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

    it(`should warn about missing phraseId`, async function() {
      this.timeout(100000)
      let response = await ajax({ url, body: { token: author.token, userId: author.id }})
      let { message } = await response.json()
      expect(message).to.eq(`Must provide a phraseId`)
    })

    it(`should only allow author to delete`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url,
        body: {
          token: observer.token,
          userId: observer.id,
          phraseId,
        },
      })

      let { message } = await response.json()
      expect(message).to.eq(`Only original author can delete a Phrase!`)
    })

    it(`should successfully delete a phrase`, async function() {
      this.timeout(100000)
      let response = await ajax({ url, body: { token: author.token, userId: author.id, phraseId }})
      let { message } = await response.json()
      expect(message).to.eq(`Phrase deleted!`)

      let db = await r.connect({ host: `localhost`, db: `test`, port: 28015 })
      let loadedPhrase = await r.table(`phrases`).get(phraseId).run(db)
      expect(loadedPhrase).to.be.null
    })
  })
}
