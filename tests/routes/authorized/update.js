import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'

export default ({
  domain,
  author,
  observer,
  phraseId,
}) => {
  let url = `${domain}/api/update`

  describe(`update`, () => {
    it(`should successfully update if userId is in masterControl`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url,
        body: {
          userId: author.id,
          token: author.token,
          phraseId,
          phraseName: ``,
          phraseState: {},
        },
      })

      let { message } = await response.json()
      expect(message).to.eq(`Autosave success.`)
    })

    it(`should only allow user with master control to update`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url,
        body: {
          userId: observer.id,
          token: observer.token,
          phraseId,
          phraseName: ``,
          phraseState: {},
        },
      })

      let { message } = await response.json()
      expect(message).to.eq(`You do not have permission to edit this Phrase.`)
    })
  })
}
