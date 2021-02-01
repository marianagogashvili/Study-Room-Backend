const { validationResult } = require('express-validator');
const Assignment = require("../models/assignment");

exports.createAssignment = async (req, res, next) => {
	try {
		console.log(req.body);
		console.log(req.file);

		const title = req.body.title;
		const description = req.body.description;
		const courseId = req.body.courseId;
		const topicId = req.body.topicId;    
		const fileUrl = req.file.path;
		const availableFrom = req.body.availableFrom;
		const deadline = req.body.deadline;

		const assignment = new Assignment({
			title: title, 
			description: description,
			fileUrl: fileUrl,
			course: courseId,
			topic: topicId,
			availableFrom: availableFrom,
			deadline: deadline
		});

		await assignment.save();
		res.status(201).json(assignment);
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};

exports.getByCourse =  async (req, res, next) => {
	try {
		const courseId = req.body.courseId;

		const assignments = await Assignment.find({course: courseId});

		res.status(200).json(assignments);
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};
