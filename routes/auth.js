const express = require('express');
const studentController = require('../controllers/student');
const { body } = require('express-validator');

const router = express.Router();

router.post('/register',
 [
 	body('fullName').not().isEmpty(), 
 	body('login').trim().isLength({min: 3}).not().isEmpty(), 
 	body('password').trim().isLength({min: 3}).not().isEmpty() 
 ],
 studentController.register);

module.exports = router;