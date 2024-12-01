const mongoose = require('mongoose');
const SearchHistory = mongoose.model('SearchHistory');
const Bookmark = mongoose.model('Bookmark');

// 검색 기록 목록 조회 (페이지네이션)
exports.getSearchHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; // 한 페이지당 10개 항목
        const skip = (page - 1) * limit;
        const userId = req.user._id;

        const total = await SearchHistory.countDocuments({ userId });

        // 검색 기록 목록 조회
        const searchHistory = await SearchHistory.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('text createdAt');

        // UI에 맞는 날짜 포맷 (YY/MM/DD) 및 데이터 구조
        const formattedHistory = searchHistory.map(record => ({
            id: record._id,
            date: record.createdAt.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '/'),
            text: record.text
        }));

        res.status(200).json({
            history: formattedHistory,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error("Error fetching search history:", error);
        res.status(500).json({ message: "Error fetching search history" });
    }
};

// 검색 기록 상세 조회
exports.getSearchHistoryDetail = async (req, res) => {
    try {
        const historyId = req.params.id;
        const userId = req.user._id;

        const searchHistory = await SearchHistory.findOne({
            _id: historyId,
            userId: userId
        });

        if (!searchHistory) {
            return res.status(404).json({ message: "Search history not found" });
        }

        // 모든 이미지 URL 수집 
        const allImageUrls = [
            searchHistory.originalImage,
            ...searchHistory.results.map(result => result.url)
        ];

        const bookmarks = await Bookmark.find({
            userId: userId,
            imageUrl: { $in: allImageUrls }
        }).select('imageUrl');

        // 북마크된 이미지 URL 집합 생성
        const bookmarkedUrls = new Set(bookmarks.map(bookmark => bookmark.imageUrl));

        const response = {
            date: searchHistory.createdAt.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '/'),
            text: searchHistory.text,
            originalImage: {
                url: searchHistory.originalImage,
                isBookmarked: bookmarkedUrls.has(searchHistory.originalImage)
            },
            results: searchHistory.results.slice(0, 10).map(result => ({
                url: result.url,
                isBookmarked: bookmarkedUrls.has(result.url)
            }))
        };

        res.status(200).json(response);

    } catch (error) {
        console.error("Error fetching search history detail:", error);
        res.status(500).json({ message: "Error fetching search history detail" });
    }
};