
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.ObjectId;

// Define the schema
var tripSchema = new Schema({
	creator: { type: Schema.Types.ObjectId, ref: 'User' },
	city: String,
	where: String,
	area: String,
	when: Date,
	type: String,
	description: String,
	
	comments: [{ 
		author: { type: Schema.Types.ObjectId, ref: 'User' },
		comment: String, 
		when: { type: Date, default: Date.now } 
	}],

	participants: [ { 
		user: { type: Schema.Types.ObjectId, ref: 'User' }, 
		joinedAt: { type: Date, default: Date.now }, 
		leavedAt: Date,  
	}],

	updatedAt: { type: Date, default: Date.now },
	createdAt: Date
});

tripSchema.pre('save', function(next) {
	if (!this.createdAt) {
		this.createdAt = Date.now();
	}
	next();
});

// Define the model
var Trip = mongoose.model('Trip', tripSchema);

// Export the model
module.exports = Trip;