const Article = require("../models/article");
const Course = require("../models/course");


let checkCourseCreator = async (courseId, teacherId) => {
	const course = await Course.findById(courseId);
	if (course.creator.toString() !== teacherId) {
		const err = new Error();
		err.data = "You are not allowed to do this";
		err.status = 403;
		throw err;
	}
}

exports.createArticle = async (req, res, next) => {
	try {
		const title = req.body.title;
		const text = req.body.text;
		const topicId = req.body.topicId;
		const courseId = req.body.courseId;

		checkCourseCreator(courseId, req.userId);
		
		const article = new Article({
			title: title,
			text: text,
			topic: topicId,
			course: courseId
		});
		await article.save();

		res.status(201).json(article);
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};


exports.getArticle = async (req, res, next) => {
	try {
		const articleId = req.body.id;

		const article = await Article.findById(articleId).populate('course');
		if (req.userId !== article.course.creator.toString() &&
			!article.course.students.includes(req.userId)) {
			const error = new Error();
			error.data = "You are not allowed to do this";
			error.status = 403;
			throw error;
		}

		res.status(201).json(article);
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};

exports.addMargin = async (req, res, next) => {
	try {
		const articleId = req.body.id;
		const val = req.body.value;

		const article = await Article.findById(articleId);
		checkCourseCreator(article.course, req.userId);

		await Article.updateOne({_id: articleId}, { $inc: {margin: val} });
		res.status(201).json("Moved");
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.updateArticle = async (req, res, next) => {
	try {
		const articleId = req.body.id;
		const title = req.body.title;
		const text = req.body.text;

		const article = await Article.findById(articleId);
		checkCourseCreator(article.course, req.userId);

		article.title = title;
		article.text = text;

		await article.save();

		res.status(201).json(article);
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};

exports.deleteArticle = async (req, res, next) => {
	try {
		const articleId = req.body.id;

		const article = await Article.findById(articleId);
		checkCourseCreator(article.course, req.userId);

		await Article.deleteOne({_id: articleId});

		res.status(201).json("Article was deleted");
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};