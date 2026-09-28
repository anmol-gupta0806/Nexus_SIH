const express = require('express');
const router = express.Router();
const imageRoutes = require('./imageRoutes');
const { ML_SERVICE_URL } = require('../config/env');
const axios = require('axios');

// Mount Image & Super-Resolution routes
router.use('/images', imageRoutes);

// System Health Check
router.get('/health', async (req, res) => {
  let mlServiceStatus = 'offline';
  let mlData = null;
  try {
    const mlHealth = await axios.get(`${ML_SERVICE_URL}/api/v1/health`, { timeout: 2000 });
    if (mlHealth.data && mlHealth.data.status === 'online') {
      mlServiceStatus = 'online';
      mlData = mlHealth.data;
    }
  } catch (err) {
    mlServiceStatus = 'unreachable';
  }

  res.json({
    status: 'online',
    service: 'Nexus Express API Server',
    timestamp: new Date().toISOString(),
    ml_service: {
      status: mlServiceStatus,
      url: ML_SERVICE_URL,
      details: mlData
    },
    version: '1.0.0'
  });
});

// Dashboard Stats
router.get('/dashboard/stats', (req, res) => {
  res.json({
    totalImagesProcessed: 148,
    activeJobs: 0,
    avgPsnr: 35.8,
    avgSsim: 0.891,
    storageUsedGb: 14.6,
    modelsAvailable: ['SwinIR Transformer', 'Sentinel-2 SRGAN', 'GeoDiffusion-SR']
  });
});

module.exports = router;
