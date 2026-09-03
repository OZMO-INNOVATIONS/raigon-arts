const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { success } = require('../utils/response');

// GET /dashboard/stats
router.get('/stats', (req, res) => {
  const orders = store.data.orders || [];
  const customers = store.data.customers || [];

  const totalOrdersCount = orders.length;
  const inProgressCount = orders.filter(o => o.orderStatus === 'In Progress').length;
  const completedOrdersCount = orders.filter(o => o.orderStatus === 'Completed').length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'Pending').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalCustomersCount = customers.length;
  const totalFramesInProduction = orders
    .filter(o => o.orderStatus === 'In Progress')
    .reduce((sum, o) => sum + (o.photos ? o.photos.length : 1), 0);

  return success(res, {
    totalOrdersCount,
    totalOrdersGrowth: '+12%',
    inProgressCount,
    inProgressStatus: 'Active in workshop',
    completedOrdersCount,
    completedStatus: 'Ready for delivery',
    pendingOrdersCount,
    pendingStatus: 'Urgent action needed',
    totalRevenue,
    revenueGrowth: '+28%',
    totalCustomersCount,
    totalFramesInProduction
  }, 'Dashboard metrics fetched successfully.');
});

// GET /dashboard/recent-orders
router.get('/recent-orders', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const orders = [...(store.data.orders || [])].slice(0, limit);
  return success(res, orders, 'Recent orders fetched successfully.');
});

module.exports = router;
