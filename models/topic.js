const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const topicSchema = Schema({
	title: {
		type: String,
		required: true
	},
	hidden: {
		type: Boolean,
		required: true,
		default: false
	},
	num: {
		type: Number,
		required: true,
	},
	course: {
		type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
	}
},
{ timestamps: true });
 
module.exports = mongoose.model('Topic', topicSchema);