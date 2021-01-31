const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Topic = require("../models/topic");
const Course = require("../models/course");

exports.createTopic = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error();
			error.statusCode = 422;
			error.data  = errors.array();
			throw error;
		}
		
		const courseId = req.body.courseId;
		const title = req.body.title;
		const hidden = req.body.hidden;
		const beforeTopic = req.body.beforeTopic;

		const course = await Course.findById(courseId);
		if (!course) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = 'This course does not exist';
			throw error;
		}

		if (!beforeTopic) {
			let numberOfTopics = await Topic.countDocuments({course: courseId});
			const num = numberOfTopics + 1;
			const topic = new Topic({
				title: title,
				hidden: hidden,
				course: courseId,
				num: num
			});
			await topic.save();
			res.status(201).json(topic);
		} else {

			const topic = new Topic({
				title: title,
				hidden: hidden,
				course: courseId,
				num: beforeTopic
			});
			await Topic.updateMany({num: {$gte: beforeTopic}}, { $inc: { num: 1 } } );

			await topic.save();

			res.status(201).json(topic);
		}
		
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
		const topics = await Topic.find({course: courseId}).sort({ num: 'asc'});
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

		res.status(201).json(topic);
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
		const topic = await Topic.findById(topicId);
		const number = topic.num;

		await Topic.deleteOne({_id: topicId});
		await Topic.updateMany({num: {$gt: number}}, { $inc: { num: -1 } } );

		res.status(201).json({message: "Topic deleted"});
	} catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}