const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { success } = require('../utils/response');

// GET /settings
router.get('/', (req, res) => {
  const settings = { ...store.data.settings };
  delete settings.adminPassword; // Don't expose password
  return success(res, settings, 'Workshop settings retrieved.');
});

// PUT /settings
router.put('/', (req, res) => {
  store.data.settings = {
    ...store.data.settings,
    ...req.body
  };
  store.saveData();

  const settings = { ...store.data.settings };
  delete settings.adminPassword;

  return success(res, settings, 'Workshop settings saved successfully.');
});

module.exports = router;
