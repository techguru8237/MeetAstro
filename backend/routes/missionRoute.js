
const express = require('express')
const router = express.Router()
const {startMission} = require('../controllers/missionController')

router.post('/start', startMission)

module.exports = router