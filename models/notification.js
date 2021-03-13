const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
	description: {
		type: String,
		required: true
	},
	title: {
		type: String
	},
	user: {
		ref: 'Student',
		type: Schema.Types.ObjectId
	},
	courseId: {
		ref: 'Course',
		type: Schema.Types.ObjectId
	},
	type: {
		type: String,
		required: true
	},
	linkId: {
		type: Schema.Types.ObjectId
	}
}, {timestamps: true});
 
module.exports = mongoose.model('Notification', notificationSchema);

// You've added assignment "firs tof the year"
// 		  descr    type       title and link
