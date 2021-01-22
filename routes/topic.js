const express = require('express');
const topicController = require('../controllers/topic');
const { body } = require('express-validator');

const Topic = require('../models/topic');

const router = express.Router();

router.get('/createTopic', topicController.createTopic);


module.exports = router;