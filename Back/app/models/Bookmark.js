const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookmarkSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'UserInfo',
        required: true
    },
    searchHistoryId: {
        type: Schema.Types.ObjectId,
        ref: 'SearchHistory',
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 복합 인덱스 생성 - 같은 사용자가 같은 이미지를 중복 북마크하는 것을 방지
BookmarkSchema.index({ userId: 1, imageUrl: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);