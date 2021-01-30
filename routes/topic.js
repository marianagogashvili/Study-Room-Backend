const express = require('express');
const topicController = require('../controllers/topic');
const { body } = require('express-validator');

const Topic = require('../models/topic');
const isAuthTeacher = require('../middleware/is-auth-teacher');

const router = express.Router();

router.post('/createTopic', [
	body('title').not().isEmpty().withMessage('Title is empty')
], isAuthTeacher, topicController.createTopic);

router.post('/getTopics', isAuthTeacher, topicController.getTopics);

router.post('/editTopic', isAuthTeacher, topicController.editTopic);

router.post('/deleteTopic', isAuthTeacher, topicController.deleteTopic);

module.exports = router;