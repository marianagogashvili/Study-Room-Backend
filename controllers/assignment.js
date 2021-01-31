const { validationResult } = require('express-validator');
const Assignment = require("../models/assignment");

exports.createAssignment = async (req, res, next) => {

	console.log(req.body);
	
	const title = req.body.title;
	const description = req.body.description;
	const courseId = req.body.courseId;
	// const fileUrl = req.body.fileUrl; ?
	const availableFrom = req.body.availableFrom;
	const deadline = req.body.deadline;

	if (!req.file) {
		const error = new Error();
		error.data ="No image provided";
		error.statusCode = 401;
		throw error;
	}
	const imageUrl = req.file.path;

};