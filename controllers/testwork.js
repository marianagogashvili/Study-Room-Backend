const { validationResult } = require('express-validator');
const Testwork = require("../models/testwork");
const Course = require("../models/course");
const Notification = require("../models/notification");

let checkCourseCreator = async (courseId, teacherId) => {
	const course = await Course.findById(courseId);
	if (course.creator.toString() !== teacherId) {
		const err = new Error();
		err.data = "You are not allowed to do this";
		err.status = 403;
		throw err;
	}
};

exports.createTest = async (req, res, next) => {
	try {
		const courseId = req.body.courseId;

		checkCourseCreator(courseId, req.userId)

		const title = req.body.title;
		const questions = req.body.questions;
		let deadline = new Date(req.body.deadline).setHours(new Date(req.body.deadline).getHours() + 2);

		const hidden = req.body.hidden;
		const timeRestriction = req.body.timeRestriction;
		const topicId = req.body.topicId;

		
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
		
		const notification = new Notification({
			title: test.title,
			description: "You've created a test",
			user: req.userId,
			type: "test",
			courseId: test.course,
			linkId: test._id
		});
		await notification.save();

		res.status(201).json({message: "Test created"});
	}  catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};


exports.addMargin = async (req, res, next) => {
	try {
		const testId = req.body.id;
		const val = req.body.value;

		const testwork = await Testwork.findById(testId);
		checkCourseCreator(testwork.course, req.userId);

		await Testwork.updateOne({_id: testId}, { $inc: {margin: val} });
		res.status(201).json("Moved");
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}


exports.updateTest = async (req, res, next) => {
	try {
		const testwork = await Testwork.findById(req.body.testId).populate('course');
		const questions = req.body.questions;

		if (!testwork) {
			const error = new Error();
			error.statusCode = 422;
			error.data  = "Testwork does not exist";
			throw error;
		}

		checkCourseCreator(testwork.course, req.userId);

		let deadline = new Date(req.body.deadline).setHours(new Date(req.body.deadline).getHours() + 2);

		testwork.title = req.body.title;
		testwork.questions = req.body.questions;
		testwork.deadline = deadline;
		testwork.hidden = req.body.hidden;
		testwork.timeRestriction = req.body.timeRestriction;

		await testwork.save();
		await Testwork.updateOne({ _id: testwork._id }, { $set: { questions: questions } });	

		const notification = new Notification({
			title: testwork.title,
			description: "You've updated a test",
			user: req.userId,
			type: "test",
			courseId: testwork.course,
			linkId: testwork._id
		});
		await notification.save();

		res.status(201).json({message: "Test updated"});
	}  catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};

exports.deleteTest = async (req, res, next) => {
	try {
		const testwork = await Testwork.findById(req.body.testId);

		checkCourseCreator(testwork.course, req.courseId);
		
		await Notification.deleteMany({linkId: testwork._id});

		await Testwork.deleteOne({_id: testwork._id}) 

		res.status(201).json({message: "Test deleted"});
	}  catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};


exports.getTest = async (req, res, next) => {
	try {
		const testId = req.body.testId;
		const testwork = await Testwork.findById(testId).populate('course');
		if (!testwork) {
			const error = new Error();
			error.statusCode = 422;
			error.data  = "Testwork does not exist";
			throw error;
		}

		if ((testwork.course.creator.toString() !== req.userId) &&
			(!testwork.course.students.includes(req.userId))) {
			const error = new Error();
			error.statusCode = 422;
			error.data  = "You are not allowed to do this";
			throw error;
		}		


		res.status(200).json(testwork);
	} catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};