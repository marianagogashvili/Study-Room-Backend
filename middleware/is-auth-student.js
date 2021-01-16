const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
	try {
		const token = req.get('Authorization').split(' ')[1];
		const decodedToken = await jwt.verify(token, 'somesecret');
		console.log(decodedToken);
		if (!decodedToken) {
			const error = new Error('Not authenticated');
			error.statusCode = 401;
			throw error;
		}
		if (decodedToken.type !== 'student') {
			const error = new Error('Not authenticated');
			error.statusCode = 401;
			throw error;
		} else if (decodedToken.type === 'student') { 
			req.userId = decodedToken.userId;
		}
	} catch (err) {
		err.statusCode = 500;
		next(err);
	}

	
	next();
}