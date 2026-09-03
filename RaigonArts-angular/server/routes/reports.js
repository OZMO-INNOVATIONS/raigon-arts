const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { success } = require('../utils/response');

// GET /reports/financials
router.get('/financials', (req, res) => {
  const orders = store.data.orders || [];

  const totalBilled = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalCollected = orders.reduce((sum, o) => sum + (o.advancePaid || 0), 0);
  const totalOutstanding = orders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0);

  const paidCount = orders.filter(o => o.paymentStatus === 'Paid').length;
  const partialCount = orders.filter(o => o.paymentStatus === 'Partial').length;
  const unpaidCount = orders.filter(o => o.paymentStatus === 'Unpaid').length;
  const totalOrders = orders.length;

  return success(res, {
    totalBilled,
    totalCollected,
    totalOutstanding,
    totalOrders,
    settlementStats: {
      paidCount,
      paidPercentage: totalOrders ? Math.round((paidCount / totalOrders) * 100) : 0,
      partialCount,
      partialPercentage: totalOrders ? Math.round((partialCount / totalOrders) * 100) : 0,
      unpaidCount,
      unpaidPercentage: totalOrders ? Math.round((unpaidCount / totalOrders) * 100) : 0
    }
  }, 'Financial metrics calculated successfully.');
});

// GET /reports/production-breakdown
router.get('/production-breakdown', (req, res) => {
  const orders = store.data.orders || [];
  const counts = {
    'Wooden Frame': 0,
    'Premium Frame': 0,
    'Classic Frame': 0,
    'Canvas Float': 0,
    'Box Frame': 0
  };

  let totalFrames = 0;
  orders.forEach(o => {
    const type = o.commonSpecs?.frameType || (o.photos && o.photos[0]?.frameType) || 'Wooden Frame';
    counts[type] = (counts[type] || 0) + (o.photos ? o.photos.length : 1);
    totalFrames += (o.photos ? o.photos.length : 1);
  });

  const breakdown = Object.keys(counts).map(type => ({
    type,
    count: counts[type],
    percentage: totalFrames > 0 ? Math.round((counts[type] / totalFrames) * 100) : 0
  }));

  return success(res, breakdown, 'Production breakdown metrics retrieved.');
});

// GET /reports/export-csv
router.get('/export-csv', (req, res) => {
  const orders = store.data.orders || [];
  let csv = 'Order Number,Customer Name,Phone,City,Order Date,Delivery Date,Total Amount,Advance Paid,Balance,Payment Status,Order Status\n';

  orders.forEach(o => {
    csv += `"${o.orderNumber}","${o.customerName}","${o.customerPhone}","${o.customerCity}","${o.orderDate}","${o.deliveryDate}",${o.totalAmount},${o.advancePaid},${o.balanceAmount},"${o.paymentStatus}","${o.orderStatus}"\n`;
  });

  res.header('Content-Type', 'text/csv; charset=utf-8');
  res.attachment(`RaigonArts_Report_${new Date().toISOString().split('T')[0]}.csv`);
  return res.send(csv);
});

module.exports = router;
