const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Topic = require("../models/topic");

exports.createTopic = async (req, res, next) => {
	const courseId = req.body.courseId;
	const teacherId = req.body.teacherId;
	const title = req.body.title;
	const hidden = req.body.hidden;

	const course = await Course.find(courseId);
	if (!course) {
		const error = new Error();
		error.statusCode = 404;
		error.data  = 'This course does not exist';
		throw error;
	}
};