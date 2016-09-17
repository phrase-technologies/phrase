import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'

export default ({ domain, author, observer, publicPhraseId, privatePhraseId }) => {
  let url = `${domain}/api/loadOne`

  describe(`loadOne`, () => {
    it(`should exist`, async function() {
      this.timeout(100000)
      let response = await ajax({ url })
      expect(response.status).to.eq(200)
    })

    it(`should retreive a phrase by its id`, async function() {
      this.timeout(100000)
      let response = await ajax({ url, body: { phraseId: publicPhraseId } })
      let { loadedPhrase } = await response.json()
      expect(loadedPhrase.id).to.eq(publicPhraseId)
    })

    it(`should only allow public phrases by unauthorized user`, async function() {
      this.timeout(100000)
      let response = await ajax({ url, body: { phraseId: privatePhraseId } })
      let { message } = await response.json()
      expect(message).to.eq(`Phrase not found!`)
    })

    it(`should allow authors to load their private phrase`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url,
        body: {
          phraseId: privatePhraseId,
          userId: author.id,
        },
      })

      let { loadedPhrase } = await response.json()
      expect(loadedPhrase.id).to.eq(privatePhraseId)
    })

    it(`should not allow observer to load private phrase`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url,
        body: {
          phraseId: privatePhraseId,
          userId: observer.id,
        },
      })

      let { message } = await response.json()
      expect(message).to.eq(`Phrase not found!`)
    })
  })
}
