const mongoose = require('mongoose');
const UserInfo = mongoose.model('UserInfo');
const UserLogs = mongoose.model('UserLogs');
const { generateToken } = require('../middlewares/auth.middleware');
const { invalidateToken } = require('../middlewares/auth.middleware');

exports.login = async (req, res) => {
  try {
    const { ID, PASSWORD } = req.body;

    // 사용자 찾기
    const user = await UserInfo.findOne({ ID });

    if (!user || !user.authenticate(PASSWORD)) {
      // 로그인 실패 로그
      const userLog = new UserLogs({
        event: '사용자 접속(로그인 실패)',
        IPAddress: getUserIP(req),
        ID: ID
      });
      await userLog.save();

      return res.status(401).json({
        message: 'Invalid credentials',
        details: 'ID or password is incorrect'
      });
    }

    // 로그인 성공 로그
    const userLog = new UserLogs({
      event: '사용자 접속(로그인 성공)',
      IPAddress: getUserIP(req),
      ID: user.ID
    });
    await userLog.save();

    // JWT 토큰 생성
    const token = generateToken(user);

    // 응답
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        ID: user.ID
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Error during login",
      error: error.message
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const { ID, PASSWORD } = req.body;

    // 사용자 존재 여부 확인
    const existingUser = await UserInfo.findOne({ ID });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 새 사용자 생성
    const newUser = new UserInfo({ ID, PASSWORD });
    await newUser.save();

    // 회원가입 로그
    const userLog = new UserLogs({
      event: '사용자 회원가입',
      IPAddress: getUserIP(req),
      ID
    });
    await userLog.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        ID: newUser.ID
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Error creating user",
      error: error.message
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    // 토큰을 블랙리스트에 추가
    if (token) {
      invalidateToken(token);
    }

    // 로그아웃 로그 생성
    const userLog = new UserLogs({
      event: '사용자 로그아웃',
      IPAddress: getUserIP(req),
      ID: req.user.ID
    });
    await userLog.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: "Error during logout" });
  }
};


// IP 주소 가져오기 유틸리티 함수
const getUserIP = (req) => {
  const forwardedIps = req.headers['x-forwarded-for'];
  if (forwardedIps) {
    return forwardedIps.split(',')[0].split(':')[3];
  }
  return req.connection.remoteAddress.split(':')[3];
};


