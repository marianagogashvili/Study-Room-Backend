const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
	try {
		const token = req.get('Authorization').split(' ')[1];
		const decodedToken = await jwt.verify(token, 'somesecret');
		if (!decodedToken) {
			const error = new Error();
			error.data = 'Not authenticated';
			error.statusCode = 401;
			throw error;
		} else { 
			req.userId = decodedToken.userId;
		}
	} catch (err) {
		err.statusCode = 500;
		next(err);
	}

	
	next();
}