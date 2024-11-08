

const jwt = require('jsonwebtoken');
const config = require('../../config/node_config');

// 토큰 블랙리스트를 저장할 Set 
const tokenBlacklist = new Set();

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1] || req.query.token;

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    // 블랙리스트에 있는 토큰인지 확인
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ message: 'Token has been invalidated' });
    }

    try {
        const decoded = jwt.verify(token, config.UsertokenSecret);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};

exports.generateToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            ID: user.ID
        },
        config.UsertokenSecret,
        {
            expiresIn: '24h'
        }
    );
};

// 토큰을 블랙리스트에 추가하는 함수
exports.invalidateToken = (token) => {
    tokenBlacklist.add(token);
};

// 블랙리스트 정리 
const cleanupBlacklist = () => {
    tokenBlacklist.forEach(token => {
        try {
            jwt.verify(token, config.UsertokenSecret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                tokenBlacklist.delete(token);
            }
        }
    });
};

// 주기적으로 블랙리스트 정리 (24시간마다)
setInterval(cleanupBlacklist, 24 * 60 * 60 * 1000);