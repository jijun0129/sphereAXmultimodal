const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;
const SearchHistory = require('../models/SearchHistory');

exports.search = async (req, res) => {
    try {
        // 1. Request Validation
        if (!req.files || !req.files.image) {
            return res.status(400).json({ message: 'Image is required' });
        }
        if (!req.body.text) {
            return res.status(400).json({ message: 'Text is required' });
        }

        const image = req.files.image;
        const text = req.body.text;
        const userId = req.user._id;

        // 2. Validate image type
        if (!image.mimetype.startsWith('image/')) {
            return res.status(400).json({ message: 'File must be an image' });
        }

        // 3. Save uploaded image
        const uploadDir = path.join(__dirname, '../../uploads/original');
        await fs.mkdir(uploadDir, { recursive: true });

        const originalFileName = `${Date.now()}-original-${image.name}`;
        const originalFilePath = path.join(uploadDir, originalFileName);

        await image.mv(originalFilePath);

        // 4. [Todo] AI 가 들어갈 부분

        // 현재는 임시 결과 반환
        const resultsDir = path.join(__dirname, '../../uploads/results');
        await fs.mkdir(resultsDir, { recursive: true });
        // 테스트를 위해 원본 이미지 복사해서 결과로 사용
        const mockResults = [];
        for (let i = 1; i <= 3; i++) {
            const resultFileName = `${Date.now()}-result${i}-${image.name}`;
            const resultFilePath = path.join(resultsDir, resultFileName);
            await fs.copyFile(originalFilePath, resultFilePath);
            mockResults.push({
                url: `/uploads/results/${resultFileName}`
            });
        }

        // 5. Save search history
        const searchHistory = new SearchHistory({
            userId,
            originalImage: `/uploads/original/${originalFileName}`,
            text,
            results: mockResults,
            status: 'completed'
        });

        await searchHistory.save();

        // 6. Return response
        res.status(200).json({
            message: 'Search completed successfully',
            searchId: searchHistory._id,
            results: mockResults
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Error processing search request' });
    }
};