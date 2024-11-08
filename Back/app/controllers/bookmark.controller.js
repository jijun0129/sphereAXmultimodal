const mongoose = require('mongoose');
const UserInfo = mongoose.model('UserInfo');
const Bookmark = mongoose.model('Bookmark');
const SearchHistory = mongoose.model('SearchHistory');

// 북마크 목록 조회 (페이지네이션)
exports.getBookmarks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12; // 한 페이지당 12개 이미지
        const skip = (page - 1) * limit;

        const userId = req.user._id;

        const total = await Bookmark.countDocuments({ userId });

        // 북마크 목록 조회 - 이미지 URL만 필요
        const bookmarks = await Bookmark.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('imageUrl _id'); // imageUrl과 id만 선택

        res.status(200).json({
            bookmarks: bookmarks.map(bookmark => ({
                id: bookmark._id,
                imageUrl: bookmark.imageUrl
            })),
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching bookmarks", error: error.message });
    }
};

// 북마크 상세 조회 
exports.getBookmark = async (req, res) => {
    try {
        const bookmarkId = req.params.id;
        const userId = req.user._id;

        const bookmark = await Bookmark.findOne({
            _id: bookmarkId,
            userId: userId
        }).populate('searchHistoryId', 'text createdAt'); // 검색어와 날짜 정보만 가져오기

        if (!bookmark) {
            return res.status(404).json({ message: "Bookmark not found" });
        }


        res.status(200).json({
            imageUrl: bookmark.imageUrl,
            text: bookmark.searchHistoryId.text,
            date: bookmark.searchHistoryId.createdAt.toISOString().split('T')[0] // YYYY-MM-DD 형식
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching bookmark", error: error.message });
    }
};

// 북마크 추가
exports.addBookmark = async (req, res) => {
    try {
        const { searchHistoryId, imageUrl } = req.body;
        const userId = req.user._id;

        const searchHistory = await SearchHistory.findById(searchHistoryId);
        if (!searchHistory) {
            return res.status(404).json({ message: "Search history not found" });
        }

        const bookmark = new Bookmark({
            userId,
            searchHistoryId,
            imageUrl
        });

        await bookmark.save();

        res.status(201).json({
            message: "Bookmark added successfully",
            bookmarkId: bookmark._id
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Image already bookmarked" });
        }
        res.status(500).json({ message: "Error adding bookmark", error: error.message });
    }
};

// 북마크 제거
exports.removeBookmark = async (req, res) => {
    try {
        const bookmarkId = req.params.id;
        const userId = req.user._id;

        const bookmark = await Bookmark.findOneAndDelete({
            _id: bookmarkId,
            userId: userId
        });

        if (!bookmark) {
            return res.status(404).json({ message: "Bookmark not found" });
        }

        res.status(200).json({ message: "Bookmark removed successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error removing bookmark", error: error.message });
    }
};