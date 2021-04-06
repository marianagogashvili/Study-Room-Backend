const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const articleController = require('../controllers/article');

const isAuthTeacher = require('../middleware/is-auth-teacher');
const isAuth = require('../middleware/is-auth');

router.post('/createArticle', isAuthTeacher, articleController.createArticle);

router.post('/getArticle', isAuth, articleController.getArticle);

router.post('/addMargin', isAuthTeacher, articleController.addMargin);

router.post('/updateArticle', isAuthTeacher, articleController.updateArticle);

router.post('/deleteArticle', isAuthTeacher, articleController.deleteArticle);

router.post('/uploadFolder', isAuthTeacher, articleController.uploadFolder);

module.exports = router;