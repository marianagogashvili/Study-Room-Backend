const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Topic = require("../models/topic");
const Course = require("../models/course");

exports.createTopic = async (req, res, next) => {
	try {
		const courseId = req.body.courseId;
		const title = req.body.title;
		const hidden = req.body.hidden;

		const course = await Course.findById(courseId);
		if (!course) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = 'This course does not exist';
			throw error;
		}
		const topic = new Topic({
			title: title,
			hidden: hidden,
			course: courseId
		});

		await topic.save();
		res.status(201).json(topic);
	} catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
	
};

exports.getTopics = async (req, res, next) => {
	try {
		const courseId = req.body.courseId;
		const topics = await Topic.find({course: courseId});
		res.status(200).json(topics);

	} catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}


exports.editTopic = async (req, res, next) => {
	try {
		const topicId = req.body.id;
		const title = req.body.title;
		const hidden = req.body.hidden;

		const topic = await Topic.findById(topicId);
		if (!topic) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = 'This topic does not exist';
			throw error;
		}
		topic.title = title;
		topic.hidden = hidden;
		
		await topic.save()

		res.status(201).json({message: "Topic updated"});
	} catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}
exports.deleteTopic = async (req, res, next) => {
	try {
		const topicId = req.body.id;
		await Topic.deleteOne({_id: topicId});
		res.status(201).json({message: "Topic deleted"});
	} catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}