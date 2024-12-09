const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');
const config = require('../../config/node_config');
const SearchHistory = mongoose.model('SearchHistory');


// Python 실행 파일 찾기
function getPythonCommand() {
	const commands = ['python3', 'python'];

	for (const cmd of commands) {
		try {
			require('child_process').execSync(`${cmd} --version`);
			return cmd;
		} catch (e) {
			continue;
		}
	}
	throw new Error('Python not found in system');
}

function parseSearchText(text) {
	// 쉼표, 공백, + 기호로 구분하여 배열로 변환
	const texts = text.split(/[\s,+]+/)
		.map(t => t.trim())
		.filter(t => t.length > 0);

	// 중복 제거
	return [...new Set(texts)];
}

module.exports = function (io, socket) {
	console.log('New socket connection, auth status:', socket.auth);

	// 에러 처리
	process.on('uncaughtException', (err) => {
		console.error('uncaughtException: ', err);
	});

	// 인증 이벤트 핸들러
	socket.on('authenticate', (token) => {
		try {
			const decoded = jwt.verify(token, config.UsertokenSecret);
			socket.user = decoded;
			socket.auth = true;
			socket.emit('authenticated');
			console.log('Socket authenticated for user:', decoded);
			// 인증 성공 후 search 이벤트 핸들러 등록
			registerSearchHandler(socket);
		} catch (error) {
			console.error('Authentication error:', error);
			socket.emit('unauthorized');
		}
	});

	// 연결 해제 처리
	socket.on('disconnect', () => {
		console.log('Client disconnected:', socket.id);
	});
};

function registerSearchHandler(socket) {
	console.log('Registering search handler for socket:', socket.id);


	if (socket.listeners("search").length > 0) {
		socket.removeAllListeners("search");
	}

	socket.on('search', async (data) => {
		try {
			const { image, text } = data;
			const userId = socket.user._id;

			console.log('Received image data type:', typeof image);
			console.log('Image data structure:', Object.keys(image));

			if (!image || !text) {
				throw new Error('이미지와 검색어가 필요합니다.');
			}

			const searchTexts = parseSearchText(text);
			if (searchTexts.length === 0) {
				throw new Error('유효한 검색어가 필요합니다.');
			}

			socket.emit('searchStatus', {
				status: 'processing',
				message: '이미지 처리를 시작합니다.'
			});


			let imageBuffer;
			try {
				// 다양한 형식의 이미지 데이터 처리
				if (Buffer.isBuffer(image)) {
					imageBuffer = image;
				} else if (Buffer.isBuffer(image.data)) {
					imageBuffer = image.data;
				} else if (Array.isArray(image)) {
					imageBuffer = Buffer.from(image);
				} else if (Array.isArray(image.data)) {
					imageBuffer = Buffer.from(image.data);
				} else if (typeof image === 'string') {
					// Base64 문자열인 경우
					const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
					imageBuffer = Buffer.from(base64Data, 'base64');
				} else if (typeof image.data === 'string') {
					const base64Data = image.data.replace(/^data:image\/\w+;base64,/, '');
					imageBuffer = Buffer.from(base64Data, 'base64');
				} else {
					console.error('Unsupported image data format:', image);
					throw new Error('지원하지 않는 이미지 형식입니다.');
				}
			} catch (err) {
				console.error('Error processing image data:', err);
				throw new Error('이미지 데이터 처리 중 오류가 발생했습니다.');
			}

			// 디렉토리 생성
			const uploadDir = path.join(__dirname, '../../uploads/original');
			const resultsDir = path.join(__dirname, '../../uploads/results');
			await Promise.all([
				fs.mkdir(uploadDir, { recursive: true }),
				fs.mkdir(resultsDir, { recursive: true })
			]);

			// 이미지 저장
			const originalFileName = `${Date.now()}-original-${image.name}`;
			const originalFilePath = path.join(uploadDir, originalFileName);

			await fs.writeFile(originalFilePath, imageBuffer);

			// 파일이 제대로 저장되었는지 확인
			try {
				await fs.access(originalFilePath);
				const stats = await fs.stat(originalFilePath);
				console.log(`File saved: ${originalFilePath}, size: ${stats.size} bytes`);
			} catch (err) {
				throw new Error(`Failed to save image file: ${err.message}`);
			}

			socket.emit('searchStatus', {
				status: 'analyzing',
				message: '이미지 분석 중...'
			});

			const pythonCommand = getPythonCommand();
			const PYTHON_PATH = '/opt/venv/bin/' + pythonCommand;

			// Python 스크립트 실행
			const pythonScript = path.join(__dirname, '../python/inf.py');
			const pythonProcess = spawn(PYTHON_PATH, [
				pythonScript,
				originalFilePath,
				searchTexts.join(',')
			], {
				env: {
					...process.env,
					PYTHONUNBUFFERED: '1',
					VIRTUAL_ENV: '/opt/venv',
					PATH: `/opt/venv/bin:${process.env.PATH}`
				}
			});

			let result = '';
			let error = '';

			pythonProcess.stdout.on('data', (data) => {
				result += data.toString();
			});

			pythonProcess.stderr.on('data', (data) => {
				error += data.toString();
			});

			await new Promise((resolve, reject) => {
				pythonProcess.on('close', async (code) => {
					if (code !== 0) {
						reject(new Error(`Python process exited with code ${code}: ${error}`));
						return;
					}

					try {
						const inferenceResult = JSON.parse(result);

						if (inferenceResult.status === 'error') {
							reject(new Error(inferenceResult.error));
							return;
						}

						// 검색 기록 저장
						const searchHistory = new SearchHistory({
							userId,
							originalImage: `/uploads/original/${originalFileName}`,
							text: text,  // 원본 텍스트 저장
							results: inferenceResult.results.map(result => ({
								url: result.output_path.replace(path.join(__dirname, '../..'), ''),
								score: result.similarity_score,
								text: result.text  // 각 결과별 검색어 저장
							})),
							status: 'completed'
						});

						await searchHistory.save();

						// 결과 전송
						socket.emit('searchComplete', {
							status: 'completed',
							searchId: searchHistory._id,
							results: inferenceResult.results.map(result => ({
								text: result.text,
								url: result.output_path.replace(path.join(__dirname, '../..'), ''),
								score: result.similarity_score
							})),
							message: '검색이 완료되었습니다.'
						});

						resolve();
					} catch (err) {
						console.error('Error processing result:', err);
						reject(err);
					}
				});

				pythonProcess.on('error', (err) => {
					console.error('Failed to start Python process:', err);
					reject(err);
				});
			});

		} catch (error) {
			console.error('Search error:', error);
			socket.emit('searchError', {
				status: 'error',
				message: error.message || '검색 처리 중 오류가 발생했습니다.'
			});
		}
	});

	socket.on('disconnect', () => {
		console.log('Client disconnected:', socket.id);
	});
};