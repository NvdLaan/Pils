const express = require('express')
const router = express.Router()
const user = require('../../models/user')
const beer = require('../../models/beer')
const store = require('../../models/store')
const cron = require('node-cron')
const script = require('../../methods/dbImport')
const isAuthenticated = require('../../methods/isAuthenticated')

let aanbiedingen
const query = () => {
  beer.find({ validity: { $gte: Date() } }).exec(function (err, result) {
    if (err) console.error(err)
    aanbiedingen = result
  })
}
const dbImport = async () => {
  await script()
  query()
}
cron.schedule('7 * * * *', async () => {
  console.log('Cron running: import()')
  await dbImport()
  query()
})
query()

router.get('/aanbiedingen', isAuthenticated, function (req, res) {
  res.json(aanbiedingen)
})

// Example on how to get data for specific store
router.get('/aanbiedingen:store', isAuthenticated, function (req, res) {
  let store = req.params.store
  let query = beer.find({ store })
  query.exec(function (err, results) {
    if (err) throw err
    res.json(results)
  })
})

router.get('/stores', isAuthenticated, function (req, res) {
  store.findOne({}).exec(function (err, result) {
    if (err) console.error(err)
    res.json(result)
  })
})

// DEBUG { $set: req.body.newStores }
// DEBUG { $set: {"test" : "test"} }
router.post('/stores', isAuthenticated, function (req, res) {
  store.findOneAndUpdate({}, { $set: req.body.newStores }, { strict: false, new: true }, function (err, result) {
    if (err) console.error(err)
    res.json(result)
  })
})

router.delete('/stores', isAuthenticated, function (req, res) {
  console.log(req.body)
  store.updateOne({}, { $unset: req.body.remove }, { strict: false }, function (err, result) {
    if (err) console.error(err)
    res.json(result.ok)
  })
})

router.post('/import', isAuthenticated, function (req, res) {
  dbImport()
  res.json('received')
})

router.post('/login', function (req, res) {
  if (req.body.email && req.body.password) {
    user.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        res.status(403).send('Incorrect username or password')
      } else {
        console.log(`User ${req.body.email} has logged in.`)
        req.session.userId = user._id
        res.sendStatus(200)
        // return "this.$router.push('/home')" // idk if the client can handle this
      }
    })
  } else {
    res.status(403).send('Missing fields')
    console.error('Missing fields at login')
  }
})

module.exports = router
