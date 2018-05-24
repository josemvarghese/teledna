const mongoose = require('mongoose');
const throttleSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 60 // (60 * 1), one minutes
    },
    hits:Number,
    userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
});

throttleSchema.index({ createdAt: 1  }, { expireAfterSeconds: 60 });
module.exports = mongoose.model('Throttle', throttleSchema);