const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { success } = require('../utils/response');

// GET /photos
router.get('/', (req, res) => {
  const orders = store.data.orders || [];
  let photos = [];

  orders.forEach(o => {
    if (o.photos && o.photos.length) {
      o.photos.forEach(p => {
        photos.push({
          id: p.id,
          orderId: o.orderNumber,
          customerId: o.customerId,
          customerName: o.customerName,
          photoName: p.photoName,
          photoUrl: p.photoUrl,
          frameSize: p.frameSize || (o.commonSpecs ? o.commonSpecs.frameSize : '12 × 18 inch'),
          orientation: p.orientation || (o.commonSpecs ? o.commonSpecs.orientation : 'Landscape'),
          uploadedAt: o.createdAt
        });
      });
    }
  });

  const { orientation, search } = req.query;
  if (orientation && orientation !== 'All') {
    photos = photos.filter(p => p.orientation === orientation);
  }

  if (search) {
    const q = search.trim().toLowerCase();
    photos = photos.filter(p =>
      p.photoName.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.orderId.toLowerCase().includes(q)
    );
  }

  return success(res, photos, 'Photo gallery retrieved successfully.');
});

// POST /photos/upload
router.post('/upload', (req, res) => {
  const { photos, orderId } = req.body;
  const uploaded = (photos || []).map((p, idx) => ({
    id: 'p_upl_' + Date.now() + '_' + idx,
    photoName: p.name || `Photo_${idx + 1}.jpg`,
    photoUrl: p.dataUrl || p.photoUrl || 'assets/images/sample_frame_1.svg',
    fileSizeBytes: 2048500,
    dimensions: { width: 1920, height: 1080 },
    mimeType: 'image/jpeg'
  }));

  return success(res, uploaded, 'Photos uploaded successfully.', 201);
});

module.exports = router;
