const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const customerRoutes = require('./routes/customers');
const orderRoutes = require('./routes/orders');
const photoRoutes = require('./routes/photos');
const frameRoutes = require('./routes/frames');
const reportRoutes = require('./routes/reports');
const settingRoutes = require('./routes/settings');
const notificationRoutes = require('./routes/notifications');
const backupRoutes = require('./routes/backup');

// Mount API v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/photos', photoRoutes);
app.use('/api/v1/frames', frameRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/backup', backupRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', system: 'Raigon Arts REST API', time: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    error: 'NOT_FOUND',
    message: `API endpoint ${req.method} ${req.url} does not exist.`
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Raigon Arts REST API Server running on http://localhost:${PORT}/api/v1`);
});

module.exports = app;
