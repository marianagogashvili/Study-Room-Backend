const { validationResult } = require('express-validator');
const Testwork = require("../models/testwork");

exports.createTest = async (req, res, next) => {
	try {
		const courseId = req.body.courseId;
		
		const course = await Course.findById(courseId);
		if (course.creator.toString() !== req.userId) {
			const error = new Error();
			error.statusCode = 422;
			error.data  = "You are not allowed to do this";
			throw error;
		}

		const title = req.body.title;
		const questions = req.body.questions;
		const dealine = req.body.dealine;
		const timeRestriction = req.body.timeRestriction;
		
		const test = new Testwork({
			title: title,
			course: courseId,
			deadline: deadline,
			timeRestriction: timeRestriction
		});
		test.questions.push(...questions);
		await test.save();

	}  catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};