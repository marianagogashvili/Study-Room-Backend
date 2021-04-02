const express = require('express');
const postController = require('../controllers/post');
const { body } = require('express-validator');

const isAuthTeacher = require('../middleware/is-auth-teacher');
const isAuthStudent = require('../middleware/is-auth-student');
const isAuth = require('../middleware/is-auth');

const Post = require('../models/post');

const router = express.Router();

router.post('/createPost', [
	body('title').trim().not().isEmpty()
], isAuthTeacher, postController.createPost);

router.post('/getPostsByCourse', isAuth, postController.getPostsByCourse);

router.post('/addMargin', isAuth, postController.addMargin);

router.post('/deletePost', isAuthTeacher, postController.deletePost);

module.exports = router;