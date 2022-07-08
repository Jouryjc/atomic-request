const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const port = 9999

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/axios-success', (req, res, next) => {
  res.status(200).json({
    message: 'axios-test',
  })

  next()
})

app.post('/post-axios-success', (req, res, next) => {
  res.status(200).json({
    data: req.body.params,
  })

  next()
})

app.get('/axios-failed', (req, res, next) => {
  res.status(400)
  next()
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
