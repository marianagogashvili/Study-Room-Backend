const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
	description: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	user: {
		ref: 'Student',
		type: Schema.Types.ObjectId,
		required: true
	},
	courseId: {
		ref: 'Course',
		type: Schema.Types.ObjectId
	},
	type: {
		type: String
	},
	linkId: {
		type: Schema.Types.ObjectId
	},
	seen: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date, 
		expires: '24h',
		default: Date.now
	}
});
 
module.exports = mongoose.model('Notification', notificationSchema);
