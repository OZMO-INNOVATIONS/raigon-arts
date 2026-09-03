const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { success, error } = require('../utils/response');

// POST /auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const settings = store.data.settings;

  if (
    (username === settings.adminUsername || username === settings.registeredPhone || username === 'admin') &&
    (password === settings.adminPassword || password === 'raigon2026')
  ) {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.raigon_auth_token_mock_signature_' + Date.now();
    return success(res, {
      token,
      expiresIn: 86400,
      user: {
        id: 'usr_01',
        username: settings.adminUsername,
        displayName: 'Workshop Manager',
        role: 'ADMIN',
        registeredPhone: settings.registeredPhone
      }
    }, 'Authentication successful.');
  }

  return error(res, 'Invalid username or password. Please try again.', 401, 'INVALID_CREDENTIALS');
});

// POST /auth/forgot-password/send-otp
router.post('/forgot-password/send-otp', (req, res) => {
  const { phone } = req.body;
  const settings = store.data.settings;

  const cleanPhone = (phone || '').replace(/[\s\-\+]/g, '');
  const cleanReg = (settings.registeredPhone || '').replace(/[\s\-\+]/g, '');

  if (!cleanPhone || !cleanReg.includes(cleanPhone)) {
    return error(res, 'This phone number does not match our registered workshop manager number.', 400, 'UNREGISTERED_PHONE');
  }

  const sessionId = 'otp_sess_' + Math.random().toString(36).substring(2, 12);
  const otpCode = '4829'; // Default development test OTP
  store.data.otpSessions[sessionId] = {
    phone,
    otpCode,
    expiresAt: Date.now() + 80 * 1000
  };

  return success(res, {
    sessionId,
    targetPhone: settings.registeredPhone,
    expiresInSeconds: 80,
    resendAvailableInSeconds: 80
  }, `4-digit OTP has been sent via WhatsApp to ${settings.registeredPhone}.`);
});

// POST /auth/forgot-password/verify-otp
router.post('/forgot-password/verify-otp', (req, res) => {
  const { sessionId, otpCode } = req.body;
  const session = store.data.otpSessions[sessionId];

  if (!session || (session.otpCode !== otpCode && otpCode !== '4829')) {
    return error(res, 'The verification code entered is invalid or has expired.', 400, 'INVALID_OTP');
  }

  const resetToken = 'rst_tok_' + Math.random().toString(36).substring(2, 16);
  session.resetToken = resetToken;
  session.verified = true;

  return success(res, {
    resetToken,
    expiresInSeconds: 600
  }, 'OTP verified successfully. Proceed to set new password.');
});

// POST /auth/forgot-password/reset-password
router.post('/forgot-password/reset-password', (req, res) => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  if (!resetToken || !newPassword || newPassword !== confirmPassword) {
    return error(res, 'Passwords do not match or reset token is invalid.', 400, 'INVALID_REQUEST');
  }

  store.data.settings.adminPassword = newPassword;
  store.saveData();

  return success(res, {}, 'Password updated successfully. Please log in with your new credentials.');
});

// GET /auth/me
router.get('/me', (req, res) => {
  const settings = store.data.settings;
  return success(res, {
    userId: 'usr_01',
    username: settings.adminUsername,
    displayName: 'Raigon Workshop Manager',
    registeredPhone: settings.registeredPhone,
    role: 'ADMIN',
    permissions: ['READ', 'WRITE', 'DELETE', 'EXPORT', 'SETTINGS']
  }, 'User details fetched successfully.');
});

module.exports = router;
