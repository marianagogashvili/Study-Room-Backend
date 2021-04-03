const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testworkSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	hidden: {
		type: Boolean,
		required: true
	},
	deadline: {
		type: Date
	},
	timeRestriction: {
		type: Number
	},
	topic: {
		type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
	},
	course: {
		type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
	},
	margin: {
		type: Number,
		default: 0
	},
	questions: [
		{
			title: {
				type: String,
				required: true
			},
			a: {
				type: String
			},
			b: {
				type: String
			},
			c: {
				type: String
			},
			d: {
				type: String
			},
			e: {
				type: String
			},
			f: {
				type: String
			},
			autoCheck: {
				type: Boolean
			},
			points: {
				type: Number,
				required: true
			},
			answer: {
				type: String
			},
			answers: {
				a: {
					type: Boolean
				},
				b: {
					type: Boolean
				},
				c: {
					type: Boolean
				},
				d: {
					type: Boolean
				},
				e: {
					type: Boolean
				},
				f: {
					type: Boolean
				}
			}
		}
	]
}, {timestamps: true});

module.exports = mongoose.model('Testwork', testworkSchema);