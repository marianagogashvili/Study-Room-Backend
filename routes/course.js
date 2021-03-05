const express = require('express');
const courseController = require('../controllers/course');
const { body } = require('express-validator');

const Course = require('../models/course');
const isAuthTeacher = require('../middleware/is-auth-teacher');
const isAuthStudent = require('../middleware/is-auth-student');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/getAll', courseController.getAllCourses);

router.post('/search', courseController.searchCourses);

router.post('/createCourse', [
	body('title').not().isEmpty().withMessage('Title is empty')
				 .isLength({min: 3}).withMessage('Title is too short'),
	body('description').not().isEmpty().withMessage('Description is empty')
				 .isLength({min: 3}).withMessage('Description is too short'),
	body('fieldName').not().isEmpty().withMessage('Field is empty')	 
], isAuthTeacher, courseController.createCourse);

router.post('/getCourse', isAuth, courseController.getCourse);

router.put('/editCourse',  [
	body('title').not().isEmpty().withMessage('Title is empty')
				 .isLength({min: 3}).withMessage('Title is too short'),
	body('description').not().isEmpty().withMessage('Description is empty')
				 .isLength({min: 3}).withMessage('Description is too short'),
	body('key').not().isEmpty().withMessage('Key is empty')	 
], isAuthTeacher, courseController.editCourse);

// router.post('/getStudentsOfCourse', isAuthTeacher, courseController.getStudents);
// router.post('/getStudentsOfCourse', isAuth, courseController.getStudents);

router.post('/deleteStudentFromCourse', isAuthTeacher, courseController.deleteStudent);

router.post('/findStudentsByParams', [
	body('login').trim(),
	body('fullName').trim(),
	body('group').trim()
], isAuth, courseController.findStudentsByParams);

router.post('/addStudents', isAuthTeacher, courseController.addStudents);

router.post('/deleteStudents', isAuthTeacher, courseController.deleteStudents);

router.post('/deleteCourse', isAuthTeacher, courseController.deleteCourse);

router.post('/getFeed', isAuth, courseController.getFeed); //isAuthTeacher,

router.post('/getGrades', isAuthStudent, courseController.getStudentGrades);

router.post('/registerStudent', isAuthStudent, courseController.registerStudent);

router.post('/sendStudentRequest', isAuthStudent, courseController.sendRequest);

module.exports = router; 