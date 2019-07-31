const express = require('express')
const router = express.Router()
const isAdmin = require('../../services/isAdmin')
const logging = require('../../models/log')

router.get('/', isAdmin, function (req, res) {
  logging.find({}).select('message date context type ').sort({ date: 'descending' }).exec(function (err, result) {
    if (err) console.error(err)
    res.json(result)
  })
})
router.delete('/', isAdmin, function (req, res) {
  logging.remove({}, function (err) {
    if (err) console.err(err)
    console.log('collection removed')
  })
})

module.exports = router