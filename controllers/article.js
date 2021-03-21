const Article = require("../models/article");

exports.createArticle = async (req, res, next) => {
	try {
		const title = req.body.title;
		const text = req.body.text;
		const topicId = req.body.topicId;
		const courseId = req.body.courseId;

		const course = Course.findById(courseId);
		if (req.user !== course.creator.toString()) {
			const error = new Error();
			error.data = "You are not allowed to do this";
			error.status = 403;
			throw error;
		}

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

exports.updateArticle = async (req, res, next) => {
	try {
		const articleId = req.body.articleId;
		const title = req.body.title;
		const text = req.body.text;

		const article = Article.findById(articleId).populate('course');
		if (req.user !== article.course.creator.toString()) {
			const error = new Error();
			error.data = "You are not allowed to do this";
			error.status = 403;
			throw error;
		}

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
		const articleId = req.body.articleId;

		const article = Article.findById(articleId).populate('course');
		if (req.user !== article.course.creator.toString()) {
			const error = new Error();
			error.data = "You are not allowed to do this";
			error.status = 403;
			throw error;
		}

		await Article.deleteOne({_id: articleId});

		res.status(201).json("Article was deleted");
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};