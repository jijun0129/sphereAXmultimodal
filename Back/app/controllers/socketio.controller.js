const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;
const SearchHistory = mongoose.model('SearchHistory');

module.exports = function (io, socket) {
	// 에러 처리
	process.on('uncaughtException', (err) => {
		console.error('uncaughtException: ', err);
	});

	// 검색 요청 처리
	socket.on('search', async (data) => {
		try {
			const { image, text } = data;
			const userId = socket.user._id;  // 인증된 사용자 ID

			// 검색 시작 알림
			socket.emit('searchStatus', {
				status: 'processing',
				message: '이미지 처리를 시작합니다.'
			});

			// 이미지 데이터 검증
			if (!image || !text) {
				throw new Error('이미지와 텍스트가 필요합니다.');
			}

			// 이미지 저장
			const uploadDir = path.join(__dirname, '../../uploads/original');
			await fs.mkdir(uploadDir, { recursive: true });

			const originalFileName = `${Date.now()}-original-${image.name}`;
			const originalFilePath = path.join(uploadDir, originalFileName);

			// 이미지 데이터를 파일로 저장
			const imageBuffer = Buffer.from(image.data, 'base64');
			await fs.writeFile(originalFilePath, imageBuffer);

			// 처리 상태 업데이트
			socket.emit('searchStatus', {
				status: 'analyzing',
				message: '이미지 분석 중...'
			});

			// 결과 이미지 생성
			const resultsDir = path.join(__dirname, '../../uploads/results');
			await fs.mkdir(resultsDir, { recursive: true });

			// 임시 결과
			const mockresults = [];
			for (let i = 1; i <= 3; i++) {
				const resultFileName = `${Date.now()}-result${i}-${image.name}`;
				const resultFilePath = path.join(resultsDir, resultFileName);
				await fs.copyFile(originalFilePath, resultFilePath);
				mockresults.push({
					url: `/uploads/results/${resultFileName}`
				});
			}

			// 검색 기록 저장
			const searchHistory = new SearchHistory({
				userId,
				originalImage: `/uploads/original/${originalFileName}`,
				text,
				results: mockresults,
				status: 'completed'
			});

			await searchHistory.save();

			// 최종 결과 전송
			socket.emit('searchComplete', {
				status: 'completed',
				searchId: searchHistory._id,
				results: mockresults,
				message: '검색이 완료되었습니다.'
			});

		} catch (error) {
			console.error('Search error:', error);
			socket.emit('searchError', {
				status: 'error',
				message: error.message || '검색 처리 중 오류가 발생했습니다.'
			});
		}
	});

	// 연결 해제 처리
	socket.on('disconnect', () => {
		console.log('Client disconnected:', socket.id);
	});
};