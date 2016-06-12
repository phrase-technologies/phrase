const express = require('express')
const path = require('path')
const port = process.env.NODE_ENV === `development` ? 3333 : 80
const app = express()

app.use(express.static(__dirname + '/dist'))

app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

app.listen(port)
console.log("server started on port " + port)
