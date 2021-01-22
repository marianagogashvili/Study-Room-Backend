const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const topicSchema = Schema({
	name: {
		type: String,
		required: true
	},
	hidden: {
		type: Boolean,
		required: true,
		default: false
	},
	course: {
		type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
	}
},
{ timestamps: true });
 
module.exports = mongoose.model('Topic', topicSchema);