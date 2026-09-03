const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { success, error } = require('../utils/response');

// GET /frames
router.get('/', (req, res) => {
  let frames = store.data.frames || [];
  const search = (req.query.search || '').trim().toLowerCase();

  if (search) {
    frames = frames.filter(f =>
      f.name.toLowerCase().includes(search) ||
      f.category.toLowerCase().includes(search) ||
      (f.code && f.code.toLowerCase().includes(search)) ||
      f.unit.toLowerCase().includes(search)
    );
  }

  return success(res, frames, 'Frame sizes retrieved successfully.');
});

// POST /frames
router.post('/', (req, res) => {
  const { code, name, width, height, unit, category, status } = req.body;

  if (!name || width === undefined || height === undefined) {
    return error(res, 'Name, width, and height are required.', 400, 'VALIDATION_ERROR');
  }

  const id = 'f_' + Date.now();
  const newFrame = {
    id,
    code: code || `FS-0${(store.data.frames || []).length + 1}`,
    name,
    width: Number(width),
    height: Number(height),
    unit: unit || 'inch',
    category: category || 'Standard Photo',
    activeOrdersCount: 0,
    status: status || 'Active'
  };

  store.data.frames.push(newFrame);
  store.saveData();

  return success(res, newFrame, `Frame size '${name}' created.`, 201);
});

// GET /frames/:id
router.get('/:id', (req, res) => {
  const frame = (store.data.frames || []).find(f => f.id === req.params.id);
  if (!frame) {
    return error(res, 'Frame size not found.', 404, 'NOT_FOUND');
  }
  return success(res, frame, 'Frame size details fetched.');
});

// PUT /frames/:id
router.put('/:id', (req, res) => {
  const index = (store.data.frames || []).findIndex(f => f.id === req.params.id);
  if (index === -1) {
    return error(res, 'Frame size not found.', 404, 'NOT_FOUND');
  }

  const updated = {
    ...store.data.frames[index],
    ...req.body,
    id: req.params.id
  };

  store.data.frames[index] = updated;
  store.saveData();

  return success(res, updated, 'Frame size updated successfully.');
});

// DELETE /frames/:id
router.delete('/:id', (req, res) => {
  const index = (store.data.frames || []).findIndex(f => f.id === req.params.id);
  if (index === -1) {
    return error(res, 'Frame size not found.', 404, 'NOT_FOUND');
  }

  store.data.frames.splice(index, 1);
  store.saveData();

  return success(res, {}, 'Frame size deleted successfully.');
});

module.exports = router;
