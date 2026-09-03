const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { success, error } = require('../utils/response');

// GET /customers
router.get('/', (req, res) => {
  let customers = store.data.customers || [];
  const search = (req.query.search || '').trim().toLowerCase();

  if (search) {
    customers = customers.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.phone.toLowerCase().includes(search) ||
      (c.city && c.city.toLowerCase().includes(search)) ||
      (c.address && c.address.toLowerCase().includes(search))
    );
  }

  // Calculate dynamic stats
  const orders = store.data.orders || [];
  const enriched = customers.map(c => {
    const custOrders = orders.filter(o => o.customerId === c.id || o.customerPhone === c.phone);
    return {
      ...c,
      totalOrdersCount: custOrders.length,
      totalSpent: custOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };
  });

  return success(res, {
    total: enriched.length,
    page: parseInt(req.query.page, 10) || 1,
    limit: parseInt(req.query.limit, 10) || 50,
    customers: enriched
  }, 'Customers retrieved successfully.');
});

// POST /customers
router.post('/', (req, res) => {
  const { name, phone, altPhone, city, address, pincode } = req.body;

  if (!name || !phone) {
    return error(res, 'Name and phone number are required fields.', 400, 'VALIDATION_ERROR');
  }

  const id = 'cust_' + (store.data.customers.length + 101);
  const newCustomer = {
    id,
    name,
    phone,
    altPhone: altPhone || '',
    city: city || 'Trivandrum',
    address: address || '',
    pincode: pincode || '695001',
    createdAt: new Date().toISOString(),
    totalOrdersCount: 0,
    totalSpent: 0
  };

  store.data.customers.unshift(newCustomer);
  store.saveData();

  return success(res, newCustomer, 'Customer profile created successfully.', 201);
});

// GET /customers/:id
router.get('/:id', (req, res) => {
  const customer = (store.data.customers || []).find(c => c.id === req.params.id);
  if (!customer) {
    return error(res, 'Customer not found.', 404, 'NOT_FOUND');
  }

  const orders = (store.data.orders || []).filter(
    o => o.customerId === customer.id || o.customerPhone === customer.phone
  );

  return success(res, {
    customer,
    orders
  }, 'Customer profile fetched successfully.');
});

// PUT /customers/:id
router.put('/:id', (req, res) => {
  const index = (store.data.customers || []).findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return error(res, 'Customer not found.', 404, 'NOT_FOUND');
  }

  const updated = {
    ...store.data.customers[index],
    ...req.body,
    id: req.params.id
  };

  store.data.customers[index] = updated;

  // Sync customer details in orders
  (store.data.orders || []).forEach(o => {
    if (o.customerId === updated.id) {
      if (updated.name) o.customerName = updated.name;
      if (updated.phone) o.customerPhone = updated.phone;
      if (updated.city) o.customerCity = updated.city;
    }
  });

  store.saveData();

  return success(res, updated, 'Customer profile updated successfully.');
});

// DELETE /customers/:id
router.delete('/:id', (req, res) => {
  const index = (store.data.customers || []).findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return error(res, 'Customer not found.', 404, 'NOT_FOUND');
  }

  store.data.customers.splice(index, 1);
  store.saveData();

  return success(res, {}, 'Customer profile and associated references deleted successfully.');
});

module.exports = router;
