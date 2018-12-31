const express = require('express')
const router = express.Router()
const beer = require('../../models/beer')
const store = require('../../models/store')
const counter = require('../../models/counter')
const dbImport = require('../../methods/dbImport')

let batch
counter.findOne().exec(function (err, result) {
  if (err) console.error(err)
  batch = result.counter
})
counter.watch().on('change', data => batch = data.updateDescription.updatedFields.counter)

router.get('/aanbiedingen', function (req, res) {
  let query = beer.find({ batch }) // .limit(5) // limit on 5 for testing purposes
  query.exec(function (err, results) {
    if (err) throw err
    res.json(results)
  })
})

// Example on how to get data for specific store
router.get('/aanbiedingen:store', function (req, res) {
  let store = req.params.store
  let query = beer.find({ batch, store }) // .limit(5) // limit on 5 for testing purposes
  query.exec(function (err, results) {
    if (err) throw err
    res.json(results)
  })
})

router.get('/stores', function (req, res) {
  store.findOne({}).exec(function (err, result) {
    if (err) console.error(err)
    res.json(result)
  })
})

// DEBUG { $set: req.body.newStores }
// DEBUG { $set: {"test" : "test"} }
router.post('/stores', function (req, res) {
  store.findOneAndUpdate({}, { $set: req.body.newStores }, { strict: false, new: true }, function(err, result) {
    if (err) console.error(err)
    res.json(result)
  });
})

router.delete('/stores', function (req, res) {
  console.log(req.body)
  store.updateOne({}, { $unset: req.body.remove }, { strict: false }, function(err, result) {
    if (err) console.error(err)
    res.json(result.ok)
  });
})

router.post('/import', function (req, res) {
  dbImport()
  res.json('received')
})

module.exports = router