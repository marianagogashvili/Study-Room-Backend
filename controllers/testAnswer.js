const { validationResult } = require('express-validator');
const Testwork = require("../models/testwork");
const TestAnswer = require("../models/testAnswer");

exports.saveAnswers = async (req, res, next) => {
	try {
		const testId = req.body.testId;
		const testwork = await Testwork.findById(testId).populate('course');
		// console.log(testwork.course.students.includes(req.userId));

		if (!testwork.course.students.includes(req.userId)) {
			const error = new Error();
			error.statusCode = 403;
			error.data  = 'You are not a member of this course';
			throw error;
		}
		const answers = JSON.parse(req.body.answers);

		const testAnswers = new TestAnswer({
			testwork: testId,
			student: req.userId
		});
		await testAnswers.save();
		
		await TestAnswer.updateOne({_id: testAnswers._id}, { $push: { answers: answers } });

		res.status(201).json(testAnswers);
	}  catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};

exports.getAnswers = async (req, res, next) => {
	try {
		const testId = req.body.testId;
		const answers = await TestAnswer.find({testwork: testId, student: req.userId});
		res.status(200).json(answers);
	}  catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};