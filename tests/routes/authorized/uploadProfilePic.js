import fs from 'fs'
import urlLib from 'url'
import path from 'path'
import { expect } from 'chai'

import ajax from '../../../src/helpers/ajax'
import { rUserGet } from '../../../src/helpers/db-helpers'
import { validBase64, invalidBase64 } from '../../helpers/uploadProfilePicBase64'

export default ({ globals, user }) => {
  let url = `${globals.domain}/api/uploadProfilePic`
  let pictureFile

  describe(`uploadProfilePic`, () => {
    it(`endpoint should exist`, async function() {
      this.timeout(100000)
      let response = await ajax({ url })
      expect(response.status).to.not.eq(404)
    })

    it(`should reject a request missing base64 parameter`, async function() {
      this.timeout(10000)
      let response = await ajax({ url, body: { token: user.token, userId: user.id } })
      let { message } = await response.json()
      expect(message).to.eq(`Missing base64 data url.`)
    })

    it(`should reject any file that is not an image`, async function() {
      this.timeout(10000)
      let response = await ajax({ url, body: {
        token: user.token,
        userId: user.id,
        base64: invalidBase64,
      }})
      let { message } = await response.json()
      expect(message).to.eq(`Not a valid image file, please try again.`)
    })

    it(`should accept and return an image url`, async function() {
      this.timeout(10000)
      let response = await ajax({ url, body: {
        token: user.token,
        userId: user.id,
        base64: validBase64,
      }})
      let { picture } = await response.json()
      let validPic = picture.includes(user.id)
      expect(validPic).to.eq(true)

      pictureFile = path.basename(urlLib.parse(picture).pathname)
    })

    it(`should have save the image file to the disk`, async function() {
      this.timeout(10000)
      let filePath = `public/profile/${pictureFile}`
      let fileExists = fs.existsSync(filePath)
      if(fileExists) fs.unlink(filePath) // Clean up after our test
      expect(fileExists).to.eq(true)
    })

    it(`should update the user's picture URL`, async function() {
      this.timeout(10000)
      let userFromDb = await rUserGet(globals.db, { id: user.id })
      expect(userFromDb.picture).to.exist
      let validPic = userFromDb.picture.includes(pictureFile)
      expect(validPic).to.eq(true)
    })
  })
}
