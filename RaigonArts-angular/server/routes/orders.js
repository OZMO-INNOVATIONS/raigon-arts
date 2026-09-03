const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { success, error } = require('../utils/response');

// GET /orders
router.get('/', (req, res) => {
  let orders = store.data.orders || [];
  const { status, paymentStatus, search } = req.query;

  if (status && status !== 'All') {
    orders = orders.filter(o => o.orderStatus === status);
  }

  if (paymentStatus && paymentStatus !== 'All') {
    orders = orders.filter(o => o.paymentStatus === paymentStatus);
  }

  if (search) {
    const q = search.trim().toLowerCase();
    orders = orders.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q) ||
      (o.customerCity && o.customerCity.toLowerCase().includes(q))
    );
  }

  return success(res, {
    total: orders.length,
    orders
  }, 'Orders retrieved successfully.');
});

// POST /orders (Combined customer + order creation)
router.post('/', (req, res) => {
  const { customer, order } = req.body;

  if (!customer || !customer.name || !customer.phone) {
    return error(res, 'Customer name and phone are required.', 400, 'VALIDATION_ERROR');
  }

  let customerId = customer.id;
  let existingCustomer = customerId ? (store.data.customers || []).find(c => c.id === customerId) : null;

  if (!existingCustomer) {
    existingCustomer = (store.data.customers || []).find(c => c.phone === customer.phone);
  }

  if (existingCustomer) {
    customerId = existingCustomer.id;
    existingCustomer.name = customer.name;
    existingCustomer.altPhone = customer.altPhone || existingCustomer.altPhone;
    existingCustomer.city = customer.city || existingCustomer.city;
    existingCustomer.address = customer.address || existingCustomer.address;
    existingCustomer.pincode = customer.pincode || existingCustomer.pincode;
  } else {
    customerId = 'cust_' + (store.data.customers.length + 101);
    const newCust = {
      id: customerId,
      name: customer.name,
      phone: customer.phone,
      altPhone: customer.altPhone || '',
      city: customer.city || 'Trivandrum',
      address: customer.address || '',
      pincode: customer.pincode || '695001',
      createdAt: new Date().toISOString(),
      totalOrdersCount: 0,
      totalSpent: 0
    };
    store.data.customers.unshift(newCust);
  }

  const orderNum = 'RA-' + (1000 + store.data.orders.length + 1);
  const orderId = 'ord_' + (1000 + store.data.orders.length + 1);

  const totalAmount = Number(order.totalAmount) || 0;
  const advancePaid = Number(order.advancePaid) || 0;
  const balanceAmount = Math.max(0, totalAmount - advancePaid);

  let paymentStatus = order.paymentStatus;
  if (!paymentStatus) {
    paymentStatus = balanceAmount === 0 ? 'Paid' : advancePaid > 0 ? 'Partial' : 'Unpaid';
  }

  const newOrder = {
    id: orderId,
    orderNumber: orderNum,
    customerId,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerCity: customer.city || 'Trivandrum',
    orderDate: order.orderDate || new Date().toISOString().split('T')[0],
    deliveryDate: order.deliveryDate || '',
    totalAmount,
    advancePaid,
    balanceAmount,
    paymentStatus,
    orderStatus: order.orderStatus || 'In Progress',
    configMode: order.configMode || 'same',
    photos: order.photos || [],
    commonSpecs: order.commonSpecs || null,
    createdAt: new Date().toISOString()
  };

  store.data.orders.unshift(newOrder);

  // Add notification
  store.data.notifications.unshift({
    id: 'n_' + Date.now(),
    title: 'New Order Received',
    message: `Order #${orderNum} created for ${customer.name}`,
    time: 'Just now',
    isRead: false,
    type: 'order'
  });

  store.saveData();

  return success(res, {
    orderId,
    orderNumber: orderNum,
    customerId,
    customerName: customer.name,
    totalAmount,
    advancePaid,
    balanceAmount,
    orderStatus: newOrder.orderStatus,
    paymentStatus,
    deliveryDate: newOrder.deliveryDate
  }, `Customer profile and frame order #${orderNum} created successfully.`, 201);
});

// GET /orders/:id
router.get('/:id', (req, res) => {
  const order = (store.data.orders || []).find(o => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return error(res, 'Order not found.', 404, 'NOT_FOUND');
  }
  return success(res, order, 'Order details fetched successfully.');
});

// PATCH /orders/:id/status
router.patch('/:id/status', (req, res) => {
  const { orderStatus, remarks } = req.body;
  const order = (store.data.orders || []).find(o => o.id === req.params.id || o.orderNumber === req.params.id);

  if (!order) {
    return error(res, 'Order not found.', 404, 'NOT_FOUND');
  }

  order.orderStatus = orderStatus;
  order.updatedAt = new Date().toISOString();
  if (remarks) order.remarks = remarks;

  store.saveData();

  return success(res, {
    id: order.id,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    updatedAt: order.updatedAt
  }, `Order status updated to '${orderStatus}'.`);
});

// PUT /orders/:id
router.put('/:id', (req, res) => {
  const index = (store.data.orders || []).findIndex(o => o.id === req.params.id || o.orderNumber === req.params.id);
  if (index === -1) {
    return error(res, 'Order not found.', 404, 'NOT_FOUND');
  }

  const existing = store.data.orders[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    orderNumber: existing.orderNumber
  };

  if (updated.totalAmount !== undefined || updated.advancePaid !== undefined) {
    const total = Number(updated.totalAmount) || 0;
    const advance = Number(updated.advancePaid) || 0;
    updated.balanceAmount = Math.max(0, total - advance);
    if (!req.body.paymentStatus) {
      updated.paymentStatus = updated.balanceAmount === 0 ? 'Paid' : advance > 0 ? 'Partial' : 'Unpaid';
    }
  }

  store.data.orders[index] = updated;
  store.saveData();

  return success(res, updated, `Order #${existing.orderNumber} updated successfully.`);
});

// DELETE /orders/:id
router.delete('/:id', (req, res) => {
  const index = (store.data.orders || []).findIndex(o => o.id === req.params.id || o.orderNumber === req.params.id);
  if (index === -1) {
    return error(res, 'Order not found.', 404, 'NOT_FOUND');
  }

  const removed = store.data.orders.splice(index, 1);
  store.saveData();

  return success(res, {}, `Order #${removed[0].orderNumber} and associated attachments removed.`);
});

module.exports = router;
