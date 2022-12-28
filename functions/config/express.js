const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

let app = express()
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors({ origin: true }))

module.exports = app