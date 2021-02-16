const { validationResult } = require('express-validator');
const Testwork = require("../models/testwork");
const Course = require("../models/course");

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

		console.log(req.body);

		const title = req.body.title;
		const questions = req.body.questions;
		const deadline = req.body.deadline;
		const hidden = req.body.hidden;
		const timeRestriction = req.body.timeRestriction;
		const topicId = req.body.topicId;

		console.log(topicId);
		
		const test = new Testwork({
			title: title,
			course: courseId,
			deadline: deadline,
			hidden: hidden,
			timeRestriction: timeRestriction,
			topic: topicId
		});

		await test.save();

		await Testwork.updateOne({ _id: test._id }, { $push: { questions: questions } });	
		res.status(201).json(test);
	}  catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};