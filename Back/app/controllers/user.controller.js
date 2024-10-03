require('../models/UserLogs')


const mongoose = require('mongoose');
const passport = require('passport');
const UserInfo = mongoose.model('UserInfo');
const UserLogs = mongoose.model('UserLogs');


const express = require('express');
const session = require('express-session');

exports.login = async (req, res, next) => {
  try {
    const authenticate = () =>
      new Promise((resolve, reject) => {
        passport.authenticate('local', (err, user, info) => {
          if (err) reject(err);
          if (!user) resolve({ success: false, message: info.message });
          resolve({ success: true, user });
        })(req, res, next);
      });

    const authResult = await authenticate();

    if (!authResult.success) {
      return res.status(401).json({ message: authResult.message });
    }

    const user = authResult.user;

    // 새 세션 생성
    req.session.regenerate(async (err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ message: "Error creating new session" });
      }

      await new Promise((resolve, reject) => {
        req.logIn(user, (err) => {
          if (err) reject(err);
          resolve();
        });
      });

      // 세션에 사용자 정보 저장
      req.session.userId = user._id;

      // 사용자 로그 생성
      const userLog = new UserLogs({
        event: '사용자 로그인',
        IPAddress: getUserIP(req),
        ID: user.ID
      });
      await userLog.save();

      res.status(200).json({
        message: "Login successful",
        user: { id: user._id, ID: user.ID },
        sessionId: req.sessionID
      });
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error during login" });
  }
};

exports.logout = (req, res) => {
  console.log('Logout attempt started');
  console.log('Session:', req.session);
  console.log('Is authenticated:', req.isAuthenticated());
  console.log('User:', req.user);

  if (!req.isAuthenticated()) {
    console.log('No active session or user not authenticated');
    return res.status(400).json({ message: "No active session or user not authenticated" });
  }

  const userId = req.user ? req.user.ID : 'Unknown';
  console.log('Logout attempt for user:', userId);

  try {
    req.logout();
    console.log('Logout function called successfully');

    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: "Error destroying session" });
      }

      console.log('Session destroyed successfully');
      res.clearCookie('connect.sid');

      // 로그아웃 로그 생성
      const userLog = new UserLogs({
        event: '사용자 로그아웃',
        IPAddress: getUserIP(req),
        ID: userId
      });

      userLog.save()
        .then(() => {
          console.log('Logout log saved successfully');
          console.log('Sending successful logout response');
          res.status(200).json({ message: "Logout successful" });
        })
        .catch(err => {
          console.error('Error saving logout log:', err);
          res.status(500).json({ message: "Logout successful but failed to save log" });
        });
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: "Error during logout" });
  }
};

exports.signup = async (req, res) => {
  const { ID, PASSWORD } = req.body;

  try {
    // Check if user already exists
    const existingUser = await UserInfo.findOne({ ID });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = new UserInfo({
      ID,
      PASSWORD
    });

    // Save user to database
    await newUser.save();

    // Create user log
    const userLog = new UserLogs({
      event: '사용자 회원가입',
      IPAddress: getUserIP(req),
      ID
    });
    await userLog.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

const getUserIP = (req) => {
  const forwardedIps = req.headers['x-forwarded-for'];
  if (forwardedIps) {
    return forwardedIps.split(',')[0].split(':')[3];
  }
  return req.connection.remoteAddress.split(':')[3];
};

const saveUserLog = async (id) => {
  try {
    const userLog = new UserLogs({ ID: id });
    await userLog.save();
    console.log('Success');
  } catch (err) {
    console.error('Error saving user log:', err);
  }
};

exports.userLogs = (req, res) => {
  const result = req.body.test;
  res.status(200).send(result);
};

exports.userInfo = (req, res) => {
  res.status(200).send('wkit get Method');
};

// Example usage:
saveUserLog('테스터');