import { expect } from 'chai'
import ajax from '../../../src/helpers/ajax'
import socketClientIO from 'socket.io-client'

export default ({
  domain,
  author,
  observer,
  phraseId,
  privacySetting,
}) => {
  let url = `${domain}/api/setPrivacySetting`

  describe(`setPrivacySetting`, () => {
    it(`should successfully update privacy setting if made by author`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url,
        body: {
          userId: author.id,
          token: author.token,
          phraseId,
          privacySetting,
        },
      })

      let { message } = await response.json()
      expect(message).to.eq(`Privacy setting changed successfully.`)
    })

    it(`should notify users of privacy setting change`, () => {
      let client = socketClientIO.connect(`http://localhost:9999`)

      client.on(`server::privacySettingChanged`, data => {
        expect(data.privacySetting).to.eq(privacySetting)
        client.disconnect()
      })

      ajax({
        url,
        body: {
          userId: author.id,
          token: author.token,
          phraseId,
          privacySetting,
        },
      })
    })

    it(`should only allow author to update privacy setting`, async function() {
      this.timeout(100000)

      let response = await ajax({
        url,
        body: {
          userId: observer.id,
          token: observer.token,
          phraseId,
          privacySetting,
        },
      })

      let { message } = await response.json()
      expect(message).to.eq(`You do not have permission to change this setting.`)
    })
  })
}
