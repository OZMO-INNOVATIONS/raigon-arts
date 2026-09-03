const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { success } = require('../utils/response');

// GET /notifications
router.get('/', (req, res) => {
  const notifications = store.data.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return success(res, {
    unreadCount,
    notifications
  }, 'Notifications retrieved.');
});

// PATCH /notifications/mark-all-read
router.patch('/mark-all-read', (req, res) => {
  (store.data.notifications || []).forEach(n => {
    n.isRead = true;
  });
  store.saveData();

  return success(res, {}, 'All notifications marked as read.');
});

module.exports = router;
