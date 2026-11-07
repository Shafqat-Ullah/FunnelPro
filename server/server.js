require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { connectDB } = require('./config/db');
const apiRoutes = require('./routes/api');
const { User } = require('./models');
const { seedAll } = require('./seed/seedData');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'FunnelPro SaaS API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Serve static frontend assets if built
const path = require('path');
const fs = require('fs');
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  // Check if database is empty; if so, auto-seed demo data
  try {
    const userCount = await User.countDocuments({});
    if (userCount === 0) {
      console.log('[Auto-Seed] Initial database setup: seeding initial demo account and funnels...');
      await seedAll();
    }
  } catch (err) {
    console.log('[Auto-Seed Warning]', err.message);
  }

  server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 FunnelPro SaaS Server running on port ${PORT}`);
    console.log(`📡 API Endpoints available at http://localhost:${PORT}/api`);
    console.log(`💻 Ready for full-stack client interactions`);
    console.log(`=================================================`);
  });
}

startServer();
