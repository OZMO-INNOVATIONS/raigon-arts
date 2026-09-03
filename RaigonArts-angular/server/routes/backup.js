const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { success } = require('../utils/response');

// GET /backup/export
router.get('/export', (req, res) => {
  const exportData = {
    backupVersion: '1.0',
    exportedAt: new Date().toISOString(),
    workshop: store.data.settings ? store.data.settings.workshopName : 'Raigon Arts',
    customers: store.data.customers || [],
    orders: store.data.orders || [],
    frames: store.data.frames || [],
    settings: store.data.settings || {}
  };

  return res.json(exportData);
});

// POST /backup/restore
router.post('/restore', (req, res) => {
  const { customers, orders, frames, settings } = req.body;

  if (customers && Array.isArray(customers)) store.data.customers = customers;
  if (orders && Array.isArray(orders)) store.data.orders = orders;
  if (frames && Array.isArray(frames)) store.data.frames = frames;
  if (settings && typeof settings === 'object') store.data.settings = settings;

  store.saveData();

  return success(res, {
    restoredCustomers: (store.data.customers || []).length,
    restoredOrders: (store.data.orders || []).length,
    restoredFrames: (store.data.frames || []).length
  }, 'Database successfully restored from JSON backup.');
});

module.exports = router;
