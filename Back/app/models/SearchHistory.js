const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SearchHistorySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'UserInfo',
        required: true
    },
    originalImage: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    results: [{
        url: String,
        score: Number
    }],
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);